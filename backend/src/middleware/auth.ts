import { createClerkClient, verifyToken } from "@clerk/backend";
import type { NextFunction, Request, Response } from "express";
import { env } from "../lib/env";
import { verifyLocalAuthToken } from "../lib/token";

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY || "dev" });

declare module "express-serve-static-core" {
  interface Request {
    auth?: { clerkId: string; email?: string; name?: string; imageUrl?: string };
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const payload = verifyLocalAuthToken(token);
      req.auth = { clerkId: payload.sub, email: payload.email, name: payload.name };
      return next();
    } catch {
      // Continue trying other auth providers.
    }

    if (!env.CLERK_SECRET_KEY && token.startsWith("dev:")) {
      const decoded = JSON.parse(Buffer.from(token.slice(4), "base64").toString("utf-8")) as { id?: string; email?: string; name?: string };
      if (!decoded.id || !decoded.email) return res.status(401).json({ message: "Invalid token" });
      req.auth = {
        clerkId: decoded.id,
        email: decoded.email,
        name: decoded.name ?? "Event Browser User"
      };
      return next();
    }

    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY || "dev" });
    if (!payload.sub) return res.status(401).json({ message: "Unauthorized" });

    const user = await clerk.users.getUser(payload.sub);
    req.auth = {
      clerkId: payload.sub,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Event Browser User",
      imageUrl: user.imageUrl
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
