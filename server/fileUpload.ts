import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as any).user?.id;
    const userDir = path.join(UPLOAD_DIR, userId.toString());
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = nanoid(10);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types but you can add restrictions here
    cb(null, true);
  },
});

export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

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
    return "fa-file-image";
  
  // Videos
  if (mimeType.startsWith("video/") || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'].includes(ext || '')) 
    return "fa-file-video";
  
  // Audio
  if (mimeType.startsWith("audio/") || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(ext || '')) 
    return "fa-file-audio";
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'dart', 'html', 'css', 'json', 'xml', 'yml', 'yaml', 'md', 'sql', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'].includes(ext || '')) 
    return "fa-file-code";
  
  // Documents
  if (mimeType.includes("pdf") || ext === 'pdf') return "fa-file-pdf";
  if (mimeType.includes("word") || ['doc', 'docx', 'odt', 'rtf'].includes(ext || '')) return "fa-file-word";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet") || ['xls', 'xlsx', 'ods', 'csv'].includes(ext || '')) return "fa-file-excel";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation") || ['ppt', 'pptx', 'odp'].includes(ext || '')) return "fa-file-powerpoint";
  
  // Archives
  if (mimeType.includes("zip") || mimeType.includes("rar") || ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext || '')) 
    return "fa-file-archive";
  
  // Text files
  if (mimeType.startsWith("text/") || ['txt', 'log', 'cfg', 'conf', 'ini'].includes(ext || '')) 
    return "fa-file-alt";
  
  return "fa-file";
};
