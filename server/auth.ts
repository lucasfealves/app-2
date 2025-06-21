import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization;
    
    if (token?.startsWith('Bearer ')) {
      token = token.slice(7);
    } else {
      // If no Authorization header, try custom header
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      console.log('No token provided in request headers');
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);

    if (!user) {
      console.log('User not found for token:', decoded.userId);
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    if (user.isBlocked) {
      console.log('User is blocked:', user.id);
      return res.status(403).json({ message: "Usuário bloqueado" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};