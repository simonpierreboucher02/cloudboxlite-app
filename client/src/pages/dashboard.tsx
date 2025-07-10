import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MobileHeader } from "@/components/ui/mobile-header";
import { FileGrid } from "@/components/ui/file-grid";
import { UploadModal } from "@/components/ui/upload-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FolderPlus, Grid3X3, List } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { formatFileSize } from "@/lib/file-utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: filesData, isLoading, refetch } = useQuery({
    queryKey: ["/api/files", currentFolderId],
    queryFn: async () => {
      const url = currentFolderId 
        ? `/api/files?folderId=${currentFolderId}`
        : "/api/files";
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      
      return response.json();
    },
  });

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleFolderClick = (folderId: number) => {
    setCurrentFolderId(folderId);
  };

  const handleUploadSuccess = () => {
    refetch();
    setShowUploadModal(false);
    toast({
      title: "Fichiers téléversés",
      description: "Vos fichiers ont été téléversés avec succès",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileHeader onProfileClick={() => setLocation("/profile")} />
      
      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {user?.stats?.fileCount || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Fichiers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {user?.stats?.storageUsed || "0 B"}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Utilisé</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {user?.stats?.folderCount || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Dossiers</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-4 text-sm">
          <i className="fas fa-home text-gray-400"></i>
          <span className="text-gray-600 dark:text-gray-400">Mes fichiers</span>
          {currentFolderId && (
            <>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
              <span className="text-gray-800 dark:text-gray-200">Dossier</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex-1 h-12 flex items-center justify-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Ajouter</span>
          </Button>
          <Button
            variant="outline"
            className="px-4 h-12"
            onClick={() => toast({ title: "Fonction en cours", description: "Création de dossier bientôt disponible" })}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="px-4 h-12"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Files Grid */}
        <FileGrid
          files={filesData?.files || []}
          folders={filesData?.folders || []}
          onFileSelect={handleFileSelect}
          onFolderClick={handleFolderClick}
          viewMode={viewMode}
        />

        {/* Empty State */}
        {(!filesData?.files?.length && !filesData?.folders?.length) && (
          <Card className="mt-8">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-folder-open text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun fichier</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Commencez par téléverser vos premiers fichiers
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter des fichiers
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation currentPage="files" />

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        currentFolderId={currentFolderId}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        file={selectedFile}
      />
    </div>
  );
}
