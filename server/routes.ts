import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, generateRecoveryKey, hashPassword, comparePassword, generateToken, verifyToken, AuthenticatedRequest } from "./auth";
import { upload, deleteFile, formatFileSize, getFileIcon } from "./fileUpload";
import { insertUserSchema, loginSchema, resetPasswordSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
      }

      // Hash password and generate recovery key
      const hashedPassword = await hashPassword(validatedData.password);
      const recoveryKey = generateRecoveryKey();

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        recoveryKey,
      });

      // Generate JWT token
      const token = generateToken({ id: user.id, username: user.username });

      res.status(201).json({
        message: "Compte créé avec succès",
        token,
        user: {
          id: user.id,
          username: user.username,
          recoveryKey,
        },
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ message: error.message || "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      // Generate JWT token
      const token = generateToken({ id: user.id, username: user.username });

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { username, recoveryKey, password } = resetPasswordSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.recoveryKey !== recoveryKey) {
        return res.status(401).json({ message: "Nom d'utilisateur ou clé de récupération incorrect" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(400).json({ message: error.message || "Erreur lors de la réinitialisation" });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const storageUsed = await storage.getUserStorageUsed(user.id);
      const fileCount = await storage.getUserFileCount(user.id);
      const folderCount = (await storage.getUserFolders(user.id)).length;
      const shareLinks = await storage.getUserShareLinks(user.id);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          recoveryKey: user.recoveryKey,
          createdAt: user.createdAt,
        },
        stats: {
          storageUsed: formatFileSize(storageUsed),
          storageUsedBytes: storageUsed,
          fileCount,
          folderCount,
          shareLinksCount: shareLinks.length,
        },
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Erreur lors du chargement du profil" });
    }
  });

  // File and folder routes
  app.get("/api/files", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
      
      const [folders, files] = await Promise.all([
        storage.getUserFolders(req.user!.id, folderId),
        storage.getUserFiles(req.user!.id, folderId),
      ]);

      const formattedFiles = files.map(file => ({
        ...file,
        sizeFormatted: formatFileSize(file.size),
        icon: getFileIcon(file.filename, file.mimeType || ""),
      }));

      res.json({
        folders,
        files: formattedFiles,
      });
    } catch (error) {
      console.error("Files error:", error);
      res.status(500).json({ message: "Erreur lors du chargement des fichiers" });
    }
  });

  app.post("/api/folders", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, parentId } = req.body;
      
      const folder = await storage.createFolder({
        userId: req.user!.id,
        name,
        parentId: parentId ? parseInt(parentId) : null,
      });

      res.status(201).json(folder);
    } catch (error) {
      console.error("Create folder error:", error);
      res.status(500).json({ message: "Erreur lors de la création du dossier" });
    }
  });

  app.put("/api/folders/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      
      await storage.updateFolder(id, name);
      res.json({ message: "Dossier renommé avec succès" });
    } catch (error) {
      console.error("Update folder error:", error);
      res.status(500).json({ message: "Erreur lors du renommage du dossier" });
    }
  });

  app.delete("/api/folders/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      
      await storage.deleteFolder(id);
      res.json({ message: "Dossier supprimé avec succès" });
    } catch (error) {
      console.error("Delete folder error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du dossier" });
    }
  });

  app.post("/api/files/upload", authenticateToken, upload.array("files"), async (req: AuthenticatedRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const folderId = req.body.folderId ? parseInt(req.body.folderId) : null;
      
      const uploadedFiles = [];
      
      for (const file of files) {
        const savedFile = await storage.createFile({
          userId: req.user!.id,
          folderId,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        });
        
        uploadedFiles.push({
          ...savedFile,
          sizeFormatted: formatFileSize(savedFile.size),
          icon: getFileIcon(savedFile.filename, savedFile.mimeType || ""),
        });
      }

      res.status(201).json({
        message: "Fichiers téléversés avec succès",
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Erreur lors du téléversement" });
    }
  });

  app.get("/api/files/:id/download", async (req: AuthenticatedRequest, res) => {
    try {
      // Check authentication via header or URL parameter
      let token = req.headers.authorization?.replace("Bearer ", "");
      if (!token && req.query.token) {
        token = req.query.token as string;
      }
      
      if (!token) {
        return res.status(401).json({ message: "Token d'accès requis" });
      }
      
      // Verify token manually
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Token invalide" });
      }
      
      const user = await storage.getUser(payload.id);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }
      
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file || file.userId !== user.id) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ message: "Fichier physique non trouvé" });
      }

      // Set proper headers for preview
      res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
      
      // Force download only if requested
      if (req.query.download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
      }
      
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Erreur lors du téléchargement" });
    }
  });

  app.delete("/api/files/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file || file.userId !== req.user!.id) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      // Delete physical file
      deleteFile(file.path);
      
      // Delete from database
      await storage.deleteFile(id);
      
      res.json({ message: "Fichier supprimé avec succès" });
    } catch (error) {
      console.error("Delete file error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Share link routes
  app.post("/api/files/:id/share", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const { expiresAt } = req.body;
      
      const file = await storage.getFile(fileId);
      if (!file || file.userId !== req.user!.id) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      const token = nanoid(32);
      const shareLink = await storage.createShareLink({
        fileId,
        userId: req.user!.id,
        token,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      });

      res.status(201).json({
        ...shareLink,
        shareUrl: `${req.protocol}://${req.get("host")}/api/share/${token}`,
      });
    } catch (error) {
      console.error("Share error:", error);
      res.status(500).json({ message: "Erreur lors de la création du lien de partage" });
    }
  });

  app.get("/api/share/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const shareLink = await storage.getShareLink(token);
      
      if (!shareLink) {
        return res.status(404).json({ message: "Lien de partage non trouvé" });
      }

      // Check expiration
      if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
        return res.status(410).json({ message: "Lien de partage expiré" });
      }

      const file = await storage.getFile(shareLink.fileId);
      if (!file || !fs.existsSync(file.path)) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      res.download(file.path, file.originalName);
    } catch (error) {
      console.error("Share download error:", error);
      res.status(500).json({ message: "Erreur lors du téléchargement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
