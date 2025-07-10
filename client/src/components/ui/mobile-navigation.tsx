import { Button } from "@/components/ui/button";
import { Folder, Plus, User } from "lucide-react";
import { useLocation } from "wouter";

interface MobileNavigationProps {
  currentPage: "files" | "upload" | "profile";
}

export function MobileNavigation({ currentPage }: MobileNavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="grid grid-cols-3 h-16">
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center space-y-1 h-full ${
            currentPage === "files" ? "text-primary" : "text-gray-600 dark:text-gray-400"
          }`}
          onClick={() => setLocation("/")}
        >
          <Folder className="h-5 w-5" />
          <span className="text-xs">Fichiers</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center space-y-1 h-full ${
            currentPage === "upload" ? "text-primary" : "text-gray-600 dark:text-gray-400"
          }`}
          onClick={() => {
            // This will be handled by the upload modal trigger in the dashboard
            const event = new CustomEvent("open-upload-modal");
            window.dispatchEvent(event);
          }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Ajouter</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center space-y-1 h-full ${
            currentPage === "profile" ? "text-primary" : "text-gray-600 dark:text-gray-400"
          }`}
          onClick={() => setLocation("/profile")}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profil</span>
        </Button>
      </div>
    </nav>
  );
}
