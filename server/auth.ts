import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const generateRecoveryKey = (): string => {
  const part1 = nanoid(6).toUpperCase();
  const part2 = nanoid(6).toUpperCase();
  const part3 = nanoid(6).toUpperCase();
  return `${part1}-${part2}-${part3}`;
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: { id: number; username: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { id: number; username: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch {
    return null;
  }
};

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token d'accès requis" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Token invalide" });
  }

  const user = await storage.getUser(decoded.id);
  if (!user) {
    return res.status(401).json({ message: "Utilisateur non trouvé" });
  }

  req.user = { id: user.id, username: user.username };
  next();
};
