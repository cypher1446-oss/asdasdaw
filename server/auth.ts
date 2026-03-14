import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, Request, Response, NextFunction } from "express";

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    supplierUserId?: string;
  }
}
import { pool } from "./db";

export function setupAuth(app: Express) {
  // Trust the Vercel reverse proxy for HTTPS termination
  app.set('trust proxy', 1);

  console.log("setupAuth: process.env.DATABASE_URL is", process.env.DATABASE_URL ? "defined" : "undefined");

  let sessionStore: any = undefined; // undefined = express-session MemoryStore (dev only)
  const dbUrl = process.env.DATABASE_URL;
  const isRealDb = dbUrl && !dbUrl.includes("placeholder") && !dbUrl.includes("localhost:5432");
  try {
    if (isRealDb) {
      console.log("setupAuth: Creating PgSession store...");
      sessionStore = new PgSession({
        pool,
        createTableIfMissing: true,
        tableName: 'session',
        pruneSessionInterval: false,
        errorLog: console.error
      });
    } else {
      console.warn("setupAuth: No real DATABASE_URL. Using MemoryStore (dev mode).");
    }
  } catch (err) {
    console.error("setupAuth: Error creating session store, falling back to MemoryStore:", err);
    sessionStore = undefined;
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "opinion-insights-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized as Admin" });
  }
  next();
}

export function requireSupplier(req: Request, res: Response, next: NextFunction) {
  if (!req.session.supplierUserId) {
    return res.status(401).json({ message: "Unauthorized as Supplier" });
  }
  next();
}
