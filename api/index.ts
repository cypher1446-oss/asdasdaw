import { app, initializeApp } from "../server/index";
import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
    try {
        // Ensure routes and plugins are fully registered before accepting traffic
        await initializeApp();
        return app(req, res);
    } catch (err: any) {
        console.error("CRITICAL VERCEL INIT ERROR:", err);
        return res.status(500).send(`Vercel Init Crash: ${err.message}\nStack: ${err.stack}`);
    }
}
