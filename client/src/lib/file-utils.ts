export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileIcon = (filename: string, mimeType: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  // Images
  if (mimeType.startsWith("image/") || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'].includes(ext || '')) 
    return "fas fa-file-image";
  
  // Videos
  if (mimeType.startsWith("video/") || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'].includes(ext || '')) 
    return "fas fa-file-video";
  
  // Audio
  if (mimeType.startsWith("audio/") || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(ext || '')) 
    return "fas fa-file-audio";
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'dart', 'html', 'css', 'json', 'xml', 'yml', 'yaml', 'md', 'sql', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'].includes(ext || '')) 
    return "fas fa-file-code";
  
  // Documents
  if (mimeType.includes("pdf") || ext === 'pdf') return "fas fa-file-pdf";
  if (mimeType.includes("word") || ['doc', 'docx', 'odt', 'rtf'].includes(ext || '')) return "fas fa-file-word";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet") || ['xls', 'xlsx', 'ods', 'csv'].includes(ext || '')) return "fas fa-file-excel";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation") || ['ppt', 'pptx', 'odp'].includes(ext || '')) return "fas fa-file-powerpoint";
  
  // Archives
  if (mimeType.includes("zip") || mimeType.includes("rar") || ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext || '')) 
    return "fas fa-file-archive";
  
  // Text files
  if (mimeType.startsWith("text/") || ['txt', 'log', 'cfg', 'conf', 'ini'].includes(ext || '')) 
    return "fas fa-file-alt";
  
  return "fas fa-file";
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith("image/");
};

export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith("video/");
};

export const isAudioFile = (mimeType: string): boolean => {
  return mimeType.startsWith("audio/");
};

export const isCodeFile = (filename: string, mimeType: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return [
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
  ].includes(mimeType) || ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'dart', 'html', 'css', 'json', 'xml', 'yml', 'yaml', 'md', 'sql', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'].includes(ext || '');
};

export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === "application/pdf";
};

export const isPreviewable = (filename: string, mimeType: string): boolean => {
  return isImageFile(mimeType) || 
         isVideoFile(mimeType) || 
         isAudioFile(mimeType) || 
         isCodeFile(filename, mimeType) || 
         isPdfFile(mimeType) || 
         mimeType.startsWith("text/");
};
