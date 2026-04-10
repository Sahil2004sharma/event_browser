import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/sync", requireAuth, async (req, res) => {
  if (!req.auth?.clerkId || !req.auth.email) return res.status(401).json({ message: "Unauthorized" });
  const user = await prisma.user.upsert({
    where: { clerkId: req.auth.clerkId },
    update: { email: req.auth.email, name: req.auth.name ?? "Event Browser User", avatar: req.auth.imageUrl ?? null },
    create: {
      clerkId: req.auth.clerkId,
      email: req.auth.email,
      name: req.auth.name ?? "Event Browser User",
      avatar: req.auth.imageUrl ?? null,
      interests: [],
      city: "",
      state: ""
    }
  });
  res.json(user);
});

export default router;
