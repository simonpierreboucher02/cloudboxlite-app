import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, AlertTriangle, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecoveryKeyModalProps {
  isOpen: boolean;
  recoveryKey: string;
  onContinue: () => void;
}

export function RecoveryKeyModal({ isOpen, recoveryKey, onContinue }: RecoveryKeyModalProps) {
  const { toast } = useToast();

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      toast({
        title: "Copié !",
        description: "Clé de récupération copiée dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier la clé",
        variant: "destructive",
      });
    }
  };

  const handleDownloadKey = () => {
    const text = `CloudBox Lite - Clé de récupération\n\nVotre clé de récupération: ${recoveryKey}\n\nGardez cette clé en sécurité. Elle vous permettra de récupérer l'accès à votre compte en cas d'oubli de mot de passe.\n\nDate de génération: ${new Date().toLocaleDateString('fr-FR')}`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudbox-recovery-key-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement",
      description: "Clé de récupération téléchargée",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
              <Key className="h-8 w-8 text-warning" />
            </div>
            <div>Votre clé de récupération</div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Sauvegardez cette clé précieusement. Elle est la seule façon de récupérer 
            l'accès à votre compte.
          </p>

          {/* Recovery Key Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {recoveryKey}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyKey}
                className="text-primary hover:text-primary/80"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert className="border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <p className="font-medium mb-1">Important :</p>
              <p className="text-sm">
                Cette clé vous permet de réinitialiser votre mot de passe. 
                Elle ne sera plus affichée après cette étape.
              </p>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDownloadKey}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button
              onClick={onContinue}
              className="flex-1"
            >
              Continuer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
