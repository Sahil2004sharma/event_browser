import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET ?? "change-me-in-env"
};
