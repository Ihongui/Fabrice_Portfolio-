"use server";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import Content from "@/models/Content";
import AuditLog from "@/models/AuditLog";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasUnsafeDocumentKey } from "@/lib/security/safe-document";

const schema = z.object({ key: z.string().trim().min(3).max(80).regex(/^[a-z0-9][a-z0-9._-]*$/), titleEn: z.string().max(250), titleFr: z.string().max(250), bodyEn: z.string().max(20000), bodyFr: z.string().max(20000), order: z.coerce.number().int().min(0).max(10000), visible: z.enum(["true", "false"]), data: z.string().max(10000) }).strict();
async function requireAdmin() { const session = await auth(); if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) throw new Error("Unauthorized"); return session.user.email; }
export async function saveContent(form: FormData) {
  const actor = await requireAdmin();
  const raw = Object.fromEntries(form.entries()); const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid content. Check field lengths and JSON data.");
  let data: unknown; try { data = JSON.parse(parsed.data.data || "{}"); } catch { throw new Error("The extra data field must contain valid JSON."); }
  if (!data || typeof data !== "object" || Array.isArray(data) || hasUnsafeDocumentKey(data)) throw new Error("Extra data must be an object with safe field names.");
  const doc = { key: parsed.data.key, title: { en: parsed.data.titleEn, fr: parsed.data.titleFr }, body: { en: parsed.data.bodyEn, fr: parsed.data.bodyFr }, order: parsed.data.order, visible: parsed.data.visible === "true", data };
  await connectDb(); await Content.findOneAndUpdate({ key: parsed.data.key }, { $set: doc }, { upsert: true, new: true, runValidators: true });
  await AuditLog.create({ actor, action: "content.save", target: parsed.data.key });
  revalidatePath("/"); revalidatePath("/[locale]", "page"); revalidatePath("/[locale]/projects", "page");
}
export async function deleteContent(form: FormData) {
  const actor = await requireAdmin();
  const parsed = z.object({ key: z.string().regex(/^[a-z0-9][a-z0-9._-]{2,79}$/) }).strict().safeParse({ key: form.get("key") });
  if (!parsed.success) throw new Error("Invalid content key.");
  await connectDb(); await Content.deleteOne({ key: parsed.data.key }); await AuditLog.create({ actor, action: "content.delete", target: parsed.data.key });
  revalidatePath("/"); revalidatePath("/[locale]", "page");
}
