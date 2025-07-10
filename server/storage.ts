import { users, folders, files, shareLinks, type User, type InsertUser, type Folder, type InsertFolder, type File, type InsertFile, type ShareLink, type InsertShareLink } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { recoveryKey: string }): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<void>;
  
  // Folder operations
  getUserFolders(userId: number, parentId?: number): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, name: string): Promise<void>;
  deleteFolder(id: number): Promise<void>;
  
  // File operations
  getUserFiles(userId: number, folderId?: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  getUserStorageUsed(userId: number): Promise<number>;
  getUserFileCount(userId: number): Promise<number>;
  
  // Share link operations
  createShareLink(shareLink: InsertShareLink): Promise<ShareLink>;
  getShareLink(token: string): Promise<ShareLink | undefined>;
  getUserShareLinks(userId: number): Promise<ShareLink[]>;
  deleteShareLink(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser & { recoveryKey: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    await db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getUserFolders(userId: number, parentId?: number): Promise<Folder[]> {
    const condition = parentId
      ? and(eq(folders.userId, userId), eq(folders.parentId, parentId))
      : and(eq(folders.userId, userId), isNull(folders.parentId));
    
    const result = await db
      .select()
      .from(folders)
      .where(condition)
      .orderBy(folders.name);
    
    return result as Folder[];
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const result = await db
      .insert(folders)
      .values(folder)
      .returning();
    return result[0] as Folder;
  }

  async updateFolder(id: number, name: string): Promise<void> {
    await db
      .update(folders)
      .set({ name, updatedAt: new Date() })
      .where(eq(folders.id, id));
  }

  async deleteFolder(id: number): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  async getUserFiles(userId: number, folderId?: number): Promise<File[]> {
    const condition = folderId
      ? and(eq(files.userId, userId), eq(files.folderId, folderId))
      : and(eq(files.userId, userId), isNull(files.folderId));
    
    return await db
      .select()
      .from(files)
      .where(condition)
      .orderBy(desc(files.createdAt));
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async getUserStorageUsed(userId: number): Promise<number> {
    const result = await db
      .select({ total: files.size })
      .from(files)
      .where(eq(files.userId, userId));
    
    return result.reduce((sum, file) => sum + (file.total || 0), 0);
  }

  async getUserFileCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: files.id })
      .from(files)
      .where(eq(files.userId, userId));
    
    return result.length;
  }

  async createShareLink(shareLink: InsertShareLink): Promise<ShareLink> {
    const [newShareLink] = await db
      .insert(shareLinks)
      .values(shareLink)
      .returning();
    return newShareLink;
  }

  async getShareLink(token: string): Promise<ShareLink | undefined> {
    const [shareLink] = await db
      .select()
      .from(shareLinks)
      .where(and(eq(shareLinks.token, token), eq(shareLinks.isActive, true)));
    return shareLink;
  }

  async getUserShareLinks(userId: number): Promise<ShareLink[]> {
    return await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.userId, userId))
      .orderBy(desc(shareLinks.createdAt));
  }

  async deleteShareLink(id: number): Promise<void> {
    await db.delete(shareLinks).where(eq(shareLinks.id, id));
  }
}

export const storage = new DatabaseStorage();
