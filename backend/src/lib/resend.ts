import { Resend } from "resend";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) return;
  await resend.emails.send({
    from: "LocalLoop <onboarding@resend.dev>",
    to,
    subject,
    html
  });
}
