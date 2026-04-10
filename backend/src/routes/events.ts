import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { sendEmail } from "../lib/resend";
import { broadcastEvent, registerSseClient, unregisterSseClient } from "../lib/realtime";

const router = Router();

function descriptionWordCount(description: string): number {
  return description.trim().split(/\s+/).filter(Boolean).length;
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().refine((s) => descriptionWordCount(s) > 50, {
    message: "The description must exceed 50 words."
  }),
  category: z.string(),
  imageUrl: z.string().url().optional().nullable(),
  dateTime: z.string().datetime(),
  location: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  capacity: z.number().int().positive(),
  entryFee: z.number().min(0).default(0),
  prizeDetails: z.string().max(200).optional().nullable(),
  whatsappNumber: z
    .string()
    .regex(/^\d{10}$/, "Enter correct no.")
    .optional()
    .nullable(),
  discordLink: z
    .string()
    .regex(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]+$/i, "Enter correct Discord link.")
    .optional()
    .nullable(),
  isPrivate: z.boolean().default(false)
});

router.get("/stream/live", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  registerSseClient(res);
  res.write(`event: connected\ndata: {"ok":true}\n\n`);
  req.on("close", () => {
    unregisterSseClient(res);
    res.end();
  });
});

router.get("/", async (req, res) => {
  const { category, search, startDate, endDate, lat, lng, radiusKm, minPrice, maxPrice, verifiedOnly } = req.query as Record<string, string | undefined>;
  const tokens = (search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const events = await prisma.event.findMany({
    where: {
      isCancelled: false,
      ...(category ? { category } : {}),
      ...(minPrice || maxPrice
        ? { entryFee: { ...(minPrice ? { gte: Number(minPrice) } : {}), ...(maxPrice ? { lte: Number(maxPrice) } : {}) } }
        : {}),
      ...(verifiedOnly === "true" ? { isVerified: true } : {}),
      ...(startDate || endDate
        ? { dateTime: { ...(startDate ? { gte: new Date(startDate) } : {}), ...(endDate ? { lte: new Date(endDate) } : {}) } }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { category: { contains: search } }
            ]
          }
        : {})
    },
    include: { organizer: true, _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } } },
    orderBy: { dateTime: "asc" }
  });
  const toRad = (n: number) => (n * Math.PI) / 180;
  const distanceKm = (a: number, b: number, c: number, d: number) => {
    const R = 6371;
    const dLat = toRad(c - a);
    const dLng = toRad(d - b);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
  };
  const byDistance = lat && lng && radiusKm ? events.filter((e) => distanceKm(Number(lat), Number(lng), e.lat, e.lng) <= Number(radiusKm)) : events;
  const byIntent = tokens.length
    ? byDistance.filter((e) => {
        const hay = `${e.title} ${e.description} ${e.location} ${e.category}`.toLowerCase();
        return tokens.every((t) => hay.includes(t));
      })
    : byDistance;
  res.json(byIntent.map((e) => ({ ...e, organizerName: e.organizer.name, participantCount: e._count.rsvps })));
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  if (!user) return res.status(404).json({ message: "Call /auth/sync first" });

  const duplicate = await prisma.event.findFirst({
    where: {
      organizerId: user.id,
      title: { equals: parsed.data.title },
      location: { equals: parsed.data.location },
      dateTime: new Date(parsed.data.dateTime),
      isCancelled: false
    }
  });
  if (duplicate) return res.status(409).json({ message: "A similar event is already posted." });

  const qualityScore = Math.min(
    100,
    (parsed.data.description.length >= 40 ? 35 : 10) +
      (parsed.data.address.length >= 10 ? 20 : 5) +
      (parsed.data.prizeDetails ? 15 : 0) +
      (parsed.data.whatsappNumber || parsed.data.discordLink ? 15 : 0) +
      (parsed.data.entryFee >= 0 ? 15 : 0)
  );

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      dateTime: new Date(parsed.data.dateTime),
      organizerId: user.id,
      qualityScore,
      isVerified: user.isVerifiedOrganizer || qualityScore >= 60
    }
  });
  broadcastEvent("event_created", { eventId: event.id });
  res.status(201).json(event);
});

router.get("/:id", async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { organizer: true, comments: { include: { user: true } }, rsvps: { include: { user: true }, where: { status: "CONFIRMED" } }, reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } }
  });
  if (!event) return res.status(404).json({ message: "Event not found" });
  const avg = event.reviews.length ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length : 0;
  res.json({ ...event, averageRating: Number(avg.toFixed(1)) });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!user || !event) return res.status(404).json({ message: "Not found" });
  if (event.organizerId !== user.id) return res.status(403).json({ message: "Forbidden" });
  const updated = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
  await sendEmail(user.email, `Event updated: ${updated.title}`, "<p>Your event was updated.</p>");
  broadcastEvent("event_updated", { eventId: updated.id });
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!user || !event) return res.status(404).json({ message: "Not found" });
  if (event.organizerId !== user.id) return res.status(403).json({ message: "Forbidden" });
  await prisma.event.delete({ where: { id: req.params.id } });
  broadcastEvent("event_deleted", { eventId: req.params.id });
  res.status(204).send();
});

router.post("/:id/rsvp", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!user || !event) return res.status(404).json({ message: "Not found" });
  const rsvp = await prisma.rsvp.upsert({
    where: { userId_eventId: { userId: user.id, eventId: event.id } },
    update: { status: event.isPrivate ? "PENDING" : "CONFIRMED" },
    create: { userId: user.id, eventId: event.id, status: event.isPrivate ? "PENDING" : "CONFIRMED" }
  });
  await sendEmail(user.email, `RSVP updated: ${event.title}`, `<p>Status: ${rsvp.status}</p>`);
  broadcastEvent("rsvp_updated", { eventId: event.id });
  res.status(201).json(rsvp);
});

router.delete("/:id/rsvp", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  await prisma.rsvp.delete({ where: { userId_eventId: { userId: user.id, eventId: req.params.id } } });
  broadcastEvent("rsvp_updated", { eventId: req.params.id });
  res.status(204).send();
});

router.get("/:id/participants", async (req, res) => {
  const participants = await prisma.rsvp.findMany({ where: { eventId: req.params.id, status: "CONFIRMED" }, include: { user: true } });
  res.json(participants.map((p) => ({ id: p.user.id, name: p.user.name, avatar: p.user.avatar })));
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const schema = z.object({ text: z.string().min(1).max(500) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const comment = await prisma.comment.create({ data: { eventId: req.params.id, userId: user.id, text: parsed.data.text }, include: { user: true } });
  broadcastEvent("comment_added", { eventId: req.params.id });
  res.status(201).json(comment);
});

router.get("/:id/reviews", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { eventId: req.params.id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(reviews);
});

router.post("/:id/reviews", requireAuth, async (req, res) => {
  const schema = z.object({ rating: z.number().int().min(1).max(5), text: z.string().max(500).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const review = await prisma.review.upsert({
    where: { eventId_userId: { eventId: req.params.id, userId: user.id } },
    update: { rating: parsed.data.rating, text: parsed.data.text ?? null },
    create: { eventId: req.params.id, userId: user.id, rating: parsed.data.rating, text: parsed.data.text ?? null },
    include: { user: true }
  });
  broadcastEvent("review_added", { eventId: req.params.id });
  res.status(201).json(review);
});

router.post("/:id/save", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const saved = await prisma.savedEvent.upsert({
    where: { userId_eventId: { userId: user.id, eventId: req.params.id } },
    update: {},
    create: { userId: user.id, eventId: req.params.id }
  });
  res.status(201).json(saved);
});

router.delete("/:id/save", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  await prisma.savedEvent.delete({ where: { userId_eventId: { userId: user.id, eventId: req.params.id } } });
  res.status(204).send();
});

router.post("/:id/announce", requireAuth, async (req, res) => {
  const schema = z.object({ message: z.string().min(1).max(1000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await prisma.user.findUnique({ where: { clerkId: req.auth!.clerkId } });
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!user || !event) return res.status(404).json({ message: "Not found" });
  if (event.organizerId !== user.id) return res.status(403).json({ message: "Forbidden" });

  const attendees = await prisma.rsvp.findMany({
    where: { eventId: event.id, status: "CONFIRMED" },
    include: { user: true }
  });
  await Promise.all(attendees.map((a) => sendEmail(a.user.email, `Update for ${event.title}`, `<p>${parsed.data.message}</p>`)));
  res.json({ sent: attendees.length });
});

export default router;
