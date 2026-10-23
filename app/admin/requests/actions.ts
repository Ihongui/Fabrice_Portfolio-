"use server";
import { createHash, randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import AccessRequest from "@/models/AccessRequest";
import AuditLog from "@/models/AuditLog";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { z } from "zod";
async function requireAdmin() { const session = await auth(); if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) throw new Error("Unauthorized"); return session.user.email; }
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
export async function denyRequest(form: FormData) { const email = await requireAdmin(); const id = idSchema.parse(form.get("id")); await connectDb(); const item = await AccessRequest.findByIdAndUpdate(id, { $set: { status: "denied", tokenHash: null, approvedItems: [], expiresAt: null } }, { new: true }); if (item) await AuditLog.create({ actor: email, action: "access-request.deny", target: String(item._id) }); revalidatePath("/admin/requests"); }
export async function approveRequest(form: FormData) {
  const email = await requireAdmin(); const id = idSchema.parse(form.get("id"));
  const selected = z.array(z.enum(["transcript", "references", "certificates"])).min(1).max(3).parse(form.getAll("items"));
  const days = z.coerce.number().int().refine((n) => [7, 14, 30].includes(n)).parse(form.get("days"));
  await connectDb(); const item = await AccessRequest.findById(id); if (!item || item.status !== "pending" || selected.some((value) => !item.items.includes(value))) throw new Error("Request is not eligible for approval.");
  if (!process.env.RESEND_API_KEY) throw new Error("Email delivery is not configured; request was left pending.");
  const token = randomBytes(32).toString("base64url"); const expiresAt = new Date(Date.now() + days * 86400000);
  const url = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/en/access/${token}`;
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>", to: item.email, subject: "Your portfolio document access", text: `Hello ${item.name},\n\nYour request has been approved. Access the documents here: ${url}\n\nThis link expires on ${expiresAt.toISOString()} and allows up to 10 file downloads.\n\nFabrice Ihongui` });
  if (result.error) throw new Error("Approval email could not be delivered; request was left pending.");
  item.status = "approved"; item.approvedItems = selected; item.tokenHash = createHash("sha256").update(token).digest("hex"); item.expiresAt = expiresAt; item.maxUses = 10; item.useCount = 0; item.revokedAt = undefined; await item.save();
  await AuditLog.create({ actor: email, action: "access-request.approve", target: String(item._id) }); revalidatePath("/admin/requests");
}
export async function revokeRequest(form: FormData) { const email = await requireAdmin(); const id = idSchema.parse(form.get("id")); await connectDb(); const item = await AccessRequest.findByIdAndUpdate(id, { $set: { revokedAt: new Date() } }, { new: true }); if (item) await AuditLog.create({ actor: email, action: "access-request.revoke", target: String(item._id) }); revalidatePath("/admin/requests"); }
