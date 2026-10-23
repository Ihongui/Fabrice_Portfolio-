import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Resend } from "resend";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import RateLimit from "@/models/RateLimit";
import AccessRequest from "@/models/AccessRequest";
const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), organization: z.string().trim().min(2).max(160), reason: z.string().trim().min(10).max(2000), items: z.array(z.enum(["transcript", "references", "certificates"])).min(1).max(3) }).strict();
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 5000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please review the request form." }, { status: 400 });
  const ip = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
  const key = `access:${createHash("sha256").update(ip).digest("hex")}`;
  try {
    await connectDb(); const now = new Date();
    const limit = await RateLimit.findOneAndUpdate({ key, expiresAt: mongoose.trusted({ $gt: now }) }, { $inc: { count: 1 } }, { new: true });
    if (limit && limit.count > 3) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    if (!limit) await RateLimit.findOneAndUpdate({ key }, { $set: { count: 1, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }, { upsert: true, new: true });
    const saved = await AccessRequest.create(parsed.data);
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ from: process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>", to: process.env.CONTACT_TO_EMAIL || "ihonguifabrice1@gmail.com", subject: "New portfolio access request", text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nOrganization: ${parsed.data.organization}\nItems: ${parsed.data.items.join(", ")}\nReason: ${parsed.data.reason}` });
    }
    return NextResponse.json({ ok: true, id: String(saved._id) }, { status: 201 });
  } catch { return NextResponse.json({ error: "The request service is unavailable. Please try again later." }, { status: 503 }); }
}
