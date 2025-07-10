import { useState, useEffect } from "react";
import { X, Download, Eye, Code, FileText, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/file-utils";

interface FilePreviewProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  if (!isOpen || !file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");
  const isCode = [
    "application/javascript",
    "text/javascript",
    "application/json",
    "text/html",
    "text/css",
    "text/plain",
    "application/xml",
    "text/xml",
    "application/typescript",
    "text/typescript",
    "application/python",
    "text/python",
    "application/java",
    "text/java",
    "application/cpp",
    "text/cpp",
    "application/c",
    "text/c",
    "application/php",
    "text/php",
    "application/ruby",
    "text/ruby",
    "application/go",
    "text/go",
    "application/rust",
    "text/rust",
    "application/swift",
    "text/swift",
    "application/kotlin",
    "text/kotlin",
    "application/dart",
    "text/dart",
    "application/yaml",
    "text/yaml",
    "application/toml",
    "text/toml",
    "application/markdown",
    "text/markdown",
    "application/sql",
    "text/sql"
  ].includes(file.mimeType) || file.filename.match(/\.(js|jsx|ts|tsx|html|css|json|xml|py|java|cpp|c|php|rb|go|rs|swift|kt|dart|yml|yaml|toml|md|sql|sh|bash|zsh|fish|ps1|bat|cmd)$/i);

  const isPdf = file.mimeType === "application/pdf";
  const isText = file.mimeType.startsWith("text/") || isCode;

  const token = localStorage.getItem("auth_token");
  const fileUrl = `/api/files/${file.id}/download?token=${token}`;

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
          <img
            src={fileUrl}
            alt={file.filename}
            className="max-w-full max-h-full object-contain rounded-lg"
            loading="lazy"
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            src={fileUrl}
            className="w-full max-h-96 object-contain"
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <audio
            src={fileUrl}
            className="w-full"
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      );
    }

    if (isCode || isText) {
      return <CodePreview fileUrl={fileUrl} filename={file.filename} />;
    }

    if (isPdf) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-96">
          <iframe
            src={fileUrl}
            className="w-full h-full rounded border-0"
            title={file.filename}
          />
        </div>
      );
    }

    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Prévisualisation non disponible pour ce type de fichier
        </p>
        <Button asChild>
          <a href={fileUrl} download={file.filename}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </a>
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {file.originalName}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                <span>•</span>
                <span>{file.mimeType}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`${fileUrl}&download=true`} download={file.filename}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}

function CodePreview({ fileUrl, filename }: { fileUrl: string; filename: string }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Erreur lors du chargement du fichier");
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'ps1': 'powershell',
      'bat': 'batch',
      'cmd': 'batch',
    };
    return languageMap[ext || ''] || 'text';
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{filename}</span>
          <Badge variant="secondary" className="text-xs">
            {getLanguageFromFilename(filename)}
          </Badge>
        </div>
        <div className="text-xs text-gray-400">
          {content.split('\n').length} lignes
        </div>
      </div>
      <div className="p-4 overflow-auto max-h-80">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}