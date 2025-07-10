import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  MoreVertical,
  Folder,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  File as FileIcon,
  Eye
} from "lucide-react";
import { formatFileSize, isPreviewable } from "@/lib/file-utils";
import { useToast } from "@/hooks/use-toast";
import { FilePreview } from "@/components/ui/file-preview";

interface FileGridProps {
  files: any[];
  folders: any[];
  onFileSelect: (file: any) => void;
  onFolderClick: (folderId: number) => void;
  viewMode: "grid" | "list";
}

export function FileGrid({ files, folders, onFileSelect, onFolderClick, viewMode }: FileGridProps) {
  const { toast } = useToast();
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/")) return <Image className="h-8 w-8 text-green-500" />;
    if (mimeType?.startsWith("video/")) return <Video className="h-8 w-8 text-red-500" />;
    if (mimeType?.startsWith("audio/")) return <Music className="h-8 w-8 text-purple-500" />;
    if (mimeType?.includes("pdf")) return <FileText className="h-8 w-8 text-red-600" />;
    if (mimeType?.includes("zip") || mimeType?.includes("rar")) return <Archive className="h-8 w-8 text-yellow-600" />;
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(`/api/files/${file.id}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargement",
        description: "Fichier téléchargé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec du téléchargement",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (file: any) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;
    
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (!response.ok) throw new Error("Delete failed");
      
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès",
      });
      
      window.location.reload(); // Refresh the page
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la suppression",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (file: any) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {/* Folders */}
        {folders.map((folder) => (
          <Card key={`folder-${folder.id}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={() => onFolderClick(folder.id)}
                >
                  <Folder className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="font-medium">{folder.name}</div>
                    <div className="text-sm text-gray-500">Dossier</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Renommer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Files */}
        {files.map((file) => (
          <Card key={`file-${file.id}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file.mimeType)}
                  <div>
                    <div className="font-medium truncate">{file.originalName}</div>
                    <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {isPreviewable(file.filename, file.mimeType) && (
                      <DropdownMenuItem onClick={() => handlePreview(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Aperçu
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileSelect(file)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(file)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {/* Folders */}
      {folders.map((folder) => (
        <Card 
          key={`folder-${folder.id}`} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onFolderClick(folder.id)}
        >
          <CardContent className="p-4 text-center">
            <Folder className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium truncate">{folder.name}</div>
            <div className="text-xs text-gray-500">Dossier</div>
          </CardContent>
        </Card>
      ))}

      {/* Files */}
      {files.map((file) => (
        <Card key={`file-${file.id}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              {getFileIcon(file.mimeType)}
            </div>
            <div className="text-sm font-medium truncate">{file.originalName}</div>
            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
            <div className="flex justify-center mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isPreviewable(file.filename, file.mimeType) && (
                    <DropdownMenuItem onClick={() => handlePreview(file)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileSelect(file)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(file)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <FilePreview 
        file={previewFile} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </div>
  );
}
