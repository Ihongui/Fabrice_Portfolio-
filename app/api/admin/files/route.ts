import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import { fileStorage } from "@/lib/storage";
import { detectSafeFile, fileSizeAllowed } from "@/lib/upload/validate-file";
import FileAsset from "@/models/FileAsset";
import AuditLog from "@/models/AuditLog";
const formSchema = z.object({ title: z.string().trim().min(2).max(160), type: z.enum(["cv", "transcript", "certificate", "diploma", "award", "reference", "other"]), visibility: z.enum(["public", "on_request", "private"]), altText: z.string().trim().max(300) }).strict();
async function admin(request: Request) { const session = await auth(); return !!session?.user?.email && session.user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() && request.headers.get("origin") === new URL(request.url).origin; }
export async function POST(request: Request) {
  if (!(await admin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (Number(request.headers.get("content-length") || 0) > 5 * 1024 * 1024 + 20_000) return NextResponse.json({ error: "The upload is too large." }, { status: 413 });
  let storageScope: "public" | "private" | undefined; let fileKey: string | undefined;
  try { const form = await request.formData(); const parsed = formSchema.safeParse({ title: form.get("title"), type: form.get("type"), visibility: form.get("visibility"), altText: form.get("altText") || "" }); const file = form.get("file");
    if (!parsed.success || !(file instanceof File)) return NextResponse.json({ error: "Please check the upload fields." }, { status: 400 });
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "The upload is too large." }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer()); const detected = detectSafeFile(bytes); if (!detected || file.type !== detected.mimeType || !fileSizeAllowed(detected, bytes.byteLength)) return NextResponse.json({ error: "Upload a valid PDF (up to 5 MB), PNG, JPG or WEBP image (up to 3 MB)." }, { status: 400 });
    const extension = file.name.split(".").pop()?.toLowerCase(); if (extension !== detected.extension && !(detected.extension === "jpg" && extension === "jpeg")) return NextResponse.json({ error: "The file extension does not match its contents." }, { status: 400 });
    storageScope = parsed.data.visibility === "public" ? "public" : "private"; fileKey = `${randomUUID()}.${detected.extension}`; await fileStorage.put(storageScope, fileKey, bytes.buffer as ArrayBuffer, { mimeType: detected.mimeType, title: parsed.data.title }); await connectDb();
    const saved = await FileAsset.create({ ...parsed.data, fileKey, fileName: fileKey, mimeType: detected.mimeType, size: bytes.byteLength }); await AuditLog.create({ actor: (await auth())?.user?.email, action: "file.upload", target: String(saved._id) }); return NextResponse.json({ id: String(saved._id), fileKey, visibility: saved.visibility }, { status: 201 });
  } catch { if (storageScope && fileKey) await fileStorage.delete(storageScope, fileKey).catch(() => undefined); return NextResponse.json({ error: "The file service is unavailable." }, { status: 503 }); }
}
export async function DELETE(request: Request) {
  if (!(await admin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = z.string().regex(/^[a-f\d]{24}$/i).safeParse(new URL(request.url).searchParams.get("id")); if (!id.success) return NextResponse.json({ error: "Invalid file id." }, { status: 400 });
  try { await connectDb(); const asset = await FileAsset.findById(id.data); if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 }); const scope = asset.visibility === "public" ? "public" : "private"; await fileStorage.delete(scope, asset.fileKey); await FileAsset.deleteOne({ _id: asset._id }); const email = (await auth())?.user?.email; if (email) await AuditLog.create({ actor: email, action: "file.delete", target: String(asset._id) }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "The file service is unavailable." }, { status: 503 }); }
}


