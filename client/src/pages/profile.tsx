import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { ArrowLeft, User, Key, BarChart3, Settings, LogOut, AlertTriangle, Copy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleCopyRecoveryKey = async () => {
    if (user?.user?.recoveryKey) {
      try {
        await navigator.clipboard.writeText(user.user.recoveryKey);
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
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  const storagePercentage = user?.stats?.storageUsedBytes 
    ? Math.round((user.stats.storageUsedBytes / (5 * 1024 * 1024 * 1024)) * 100) // 5GB limit
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold">Mon profil</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{user?.user?.username}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Membre depuis {new Date(user?.user?.createdAt).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Stockage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilisé</span>
              <span className="text-sm font-medium">
                {user?.stats?.storageUsed} / 5 GB
              </span>
            </div>
            <Progress value={storagePercentage} className="mb-2" />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {storagePercentage}% utilisé
            </div>
          </CardContent>
        </Card>

        {/* Recovery Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-orange-600" />
              <span>Clé de récupération</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {user?.user?.recoveryKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyRecoveryKey}
                  className="text-primary hover:text-primary/80"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Alert className="border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <p className="font-medium mb-1">Important</p>
                <p className="text-sm">
                  Cette clé vous permet de réinitialiser votre mot de passe en cas d'oubli. 
                  Gardez-la en sécurité.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Statistiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {user?.stats?.fileCount || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fichiers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {user?.stats?.folderCount || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dossiers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {user?.stats?.shareLinksCount || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Liens partagés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.stats?.loginCount || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connexions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full h-12"
            onClick={() => toast({ title: "Fonction en cours", description: "Changement de mot de passe bientôt disponible" })}
          >
            <Key className="h-4 w-4 mr-2" />
            Changer le mot de passe
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={() => toast({ title: "Fonction en cours", description: "Export des données bientôt disponible" })}
          >
            <Settings className="h-4 w-4 mr-2" />
            Télécharger mes données
          </Button>
          <Button 
            variant="destructive" 
            className="w-full h-12"
            onClick={() => toast({ title: "Fonction en cours", description: "Suppression de compte bientôt disponible" })}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Supprimer mon compte
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation currentPage="profile" />
    </div>
  );
}
