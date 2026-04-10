import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/resend";
import { env } from "../lib/env";

export function startReminderJob() {
  cron.schedule("0 * * * *", async () => {
    if (!env.DATABASE_URL) return;
    try {
      const t = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const events = await prisma.event.findMany({
        where: {
          dateTime: { gte: new Date(t.getTime() - 30 * 60 * 1000), lte: new Date(t.getTime() + 30 * 60 * 1000) }
        },
        include: { rsvps: { where: { status: "CONFIRMED" }, include: { user: true } } }
      });
      for (const event of events) {
        for (const r of event.rsvps) {
          await sendEmail(r.user.email, `Reminder: ${event.title} tomorrow`, `<p>${event.title} starts in about 24 hours.</p>`);
        }
      }
    } catch (error) {
      console.error("Reminder job failed:", error);
    }
  });
}
