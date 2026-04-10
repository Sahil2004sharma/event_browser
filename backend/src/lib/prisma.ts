import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Default local DB so `npm run dev` works without a copied .env (override via DATABASE_URL).
if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = "file:./dev.db";
}

export const prisma = new PrismaClient();
