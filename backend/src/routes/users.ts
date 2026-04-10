import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.patch("/me", requireAuth, async (req, res) => {
  const clerkId = req.auth?.clerkId;
  if (!clerkId) return res.status(401).json({ message: "Unauthorized" });
  try {
    const rawInterests = req.body.interests;
    const interests =
      typeof rawInterests === "string"
        ? rawInterests
        : Array.isArray(rawInterests)
          ? JSON.stringify(rawInterests)
          : "[]";
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        interests,
        city: req.body.city,
        state: req.body.state,
        lat: req.body.lat,
        lng: req.body.lng
      }
    });
    return res.json(user);
  } catch {
    return res.status(200).json({
      clerkId,
      email: req.auth?.email ?? "",
      name: req.auth?.name ?? "Event Browser User",
      interests: req.body.interests ?? [],
      city: req.body.city ?? "",
      state: req.body.state ?? "",
      lat: req.body.lat ?? null,
      lng: req.body.lng ?? null
    });
  }
});

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: req.auth!.clerkId },
      update: {
        email: req.auth?.email ?? "demo@eventbrowser.dev",
        name: req.auth?.name ?? "Event Browser User"
      },
      create: {
        clerkId: req.auth!.clerkId,
        email: req.auth?.email ?? "demo@eventbrowser.dev",
        name: req.auth?.name ?? "Event Browser User",
        avatar: req.auth?.imageUrl ?? null,
        interests: "[]",
        city: "",
        state: ""
      }
    });
    const [myEvents, attending] = await Promise.all([
      prisma.event.findMany({ where: { organizerId: user.id }, orderBy: { dateTime: "asc" } }),
      prisma.rsvp.findMany({ where: { userId: user.id, status: "CONFIRMED" }, include: { event: true } })
    ]);
    const saved = await prisma.savedEvent.findMany({ where: { userId: user.id }, include: { event: true } });
    return res.json({ myEvents, attending: attending.map((x) => x.event), saved: saved.map((x) => x.event) });
  } catch {
    return res.json({ myEvents: [], attending: [], saved: [] });
  }
});

export default router;
