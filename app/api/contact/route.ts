import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import RateLimit from "@/models/RateLimit";
import ContactMessage from "@/models/ContactMessage";
import { contactSchema } from "@/lib/validation/contact";
export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 7000) return NextResponse.json({ error: "Message is too large." }, { status: 413 });
  const raw = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  if (Date.now() - parsed.data.startedAt < 3000) return NextResponse.json({ error: "Please take a moment before submitting." }, { status: 400 });
  const ip = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `contact:${createHash("sha256").update(ip).digest("hex")}`;
  try {
    await connectDb();
    const now = new Date();
    const limit = await RateLimit.findOneAndUpdate({ key, expiresAt: mongoose.trusted({ $gt: now }) }, { $inc: { count: 1 } }, { new: true });
    if (limit && limit.count > 5) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    if (!limit) await RateLimit.findOneAndUpdate({ key }, { $set: { count: 1, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const message = await ContactMessage.create({ name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject, message: parsed.data.message });
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ from: process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>", to: process.env.CONTACT_TO_EMAIL || "ihonguifabrice1@gmail.com", replyTo: parsed.data.email, subject: `Portfolio contact: ${parsed.data.subject}`, text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}` }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, id: String(message._id) });
  } catch {
    return NextResponse.json({ error: "The contact service is temporarily unavailable." }, { status: 503 });
  }
}
