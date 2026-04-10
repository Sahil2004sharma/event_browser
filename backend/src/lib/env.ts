import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? ""
};
