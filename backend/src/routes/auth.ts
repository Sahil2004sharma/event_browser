import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthUser } from "../models/AuthUser";
import { signLocalAuthToken } from "../lib/token";
import crypto from "crypto";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { env } from "../lib/env";

const router = Router();
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const forgotPasswordSchema = z.object({
  email: z.string().email()
});
const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const email = parsed.data.email.toLowerCase();
  const existing = await AuthUser.findOne({ email }).lean();
  if (existing) return res.status(409).json({ message: "Email already registered. Please sign in." });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const created = await AuthUser.create({ email, name: parsed.data.name.trim(), passwordHash });
  const token = signLocalAuthToken({ sub: String(created._id), email: created.email, name: created.name });

  return res.status(201).json({
    token,
    user: { id: String(created._id), email: created.email, name: created.name }
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const email = parsed.data.email.toLowerCase();
  const user = await AuthUser.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const token = signLocalAuthToken({ sub: String(user._id), email: user.email, name: user.name });
  return res.json({ token, user: { id: String(user._id), email: user.email, name: user.name } });
});

router.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const email = parsed.data.email.toLowerCase();
  const user = await AuthUser.findOne({ email }).lean();
  if (!user) return res.json({ message: "If this email exists, a reset link has been generated." });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await PasswordResetToken.deleteMany({ email });
  await PasswordResetToken.create({ email, tokenHash, expiresAt });
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  console.log(`Password reset link for ${email}: ${resetUrl}`);
  return res.json({ message: "If this email exists, a reset link has been generated." });
});

router.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const resetEntry = await PasswordResetToken.findOne({ tokenHash });
  if (!resetEntry || resetEntry.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: "Reset token is invalid or expired." });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await AuthUser.updateOne({ email: resetEntry.email }, { $set: { passwordHash } });
  await PasswordResetToken.deleteMany({ email: resetEntry.email });
  return res.json({ message: "Password updated successfully." });
});

router.post("/sync", requireAuth, async (req, res) => {
  if (!req.auth?.clerkId || !req.auth.email) return res.status(401).json({ message: "Unauthorized" });
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: req.auth.clerkId },
      update: { email: req.auth.email, name: req.auth.name ?? "Event Browser User", avatar: req.auth.imageUrl ?? null },
      create: {
        clerkId: req.auth.clerkId,
        email: req.auth.email,
        name: req.auth.name ?? "Event Browser User",
        avatar: req.auth.imageUrl ?? null,
        interests: "[]",
        city: "",
        state: ""
      }
    });
    return res.json(user);
  } catch {
    // In local Mongo-only mode Prisma may be unavailable; do not crash auth flow.
    return res.json({
      clerkId: req.auth.clerkId,
      email: req.auth.email,
      name: req.auth.name ?? "Event Browser User",
      avatar: req.auth.imageUrl ?? null
    });
  }
});

router.post("/logout", requireAuth, async (_req, res) => {
  // Auth is token-based; server does not maintain session state.
  // Keeping this endpoint allows frontend sign-out to consistently notify backend.
  return res.status(204).send();
});

export default router;
