import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Copy, Share2 } from "lucide-react";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any;
}

export function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("never");
  const [requirePassword, setRequirePassword] = useState(false);
  const { toast } = useToast();

  const shareMutation = useMutation({
    mutationFn: async () => {
      const expirationDate = expiresAt === "never" 
        ? null 
        : new Date(Date.now() + parseInt(expiresAt) * 1000);

      const response = await fetch(`/api/files/${file.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          expiresAt: expirationDate,
          requirePassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      toast({
        title: "Lien créé",
        description: "Le lien de partage a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le lien",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copié !",
        description: "Lien copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handleCreateLink = () => {
    shareMutation.mutate();
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Partager le fichier</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <div className="font-medium">{file.originalName}</div>
              <div className="text-sm text-gray-500">{file.sizeFormatted}</div>
            </div>
          </div>

          {/* Share URL */}
          {shareUrl && (
            <div className="space-y-2">
              <Label>Lien de partage</Label>
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Expiration */}
          <div className="space-y-2">
            <Label>Expiration</Label>
            <Select value={expiresAt} onValueChange={setExpiresAt}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Jamais</SelectItem>
                <SelectItem value="3600">1 heure</SelectItem>
                <SelectItem value="86400">24 heures</SelectItem>
                <SelectItem value="604800">7 jours</SelectItem>
                <SelectItem value="2592000">30 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password Protection */}
          <div className="flex items-center justify-between">
            <Label>Mot de passe requis</Label>
            <Switch
              checked={requirePassword}
              onCheckedChange={setRequirePassword}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateLink}
              disabled={shareMutation.isPending}
              className="flex-1"
            >
              {shareMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Créer le lien
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
