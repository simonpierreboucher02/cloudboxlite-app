import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cloud, User, Moon, Sun } from "lucide-react";

interface MobileHeaderProps {
  onProfileClick: () => void;
}

export function MobileHeader({ onProfileClick }: MobileHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">CloudBox Lite</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="p-2 rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
