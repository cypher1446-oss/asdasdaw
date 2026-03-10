import { app, initializeApp } from "../server/index";
import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
    // Ensure routes and plugins are fully registered before accepting traffic
    await initializeApp();
    return app(req, res);
}
