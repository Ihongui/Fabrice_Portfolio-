import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import { fileStorage } from "@/lib/storage";
import AccessRequest from "@/models/AccessRequest";
import FileAsset from "@/models/FileAsset";
type AssetRecord = { type: string; mimeType: string; size: number; fileName: string };
const category = (type: string) => type === "transcript" ? "transcript" : type === "reference" ? "references" : ["certificate", "diploma", "award"].includes(type) ? "certificates" : null;
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params; const key = segments.join("/");
  if (!/^[a-f\d-]{36}\.(pdf|png|jpg|webp)$/.test(key)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await connectDb(); const asset = await FileAsset.findOne({ fileKey: key, visibility: "on_request" }).lean<AssetRecord>(); if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const session = await auth(); const isAdmin = !!session?.user?.email && session.user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
    if (!isAdmin) {
      const token = new URL(request.url).searchParams.get("token"); if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const hash = createHash("sha256").update(token).digest("hex"); const required = category(asset.type); if (!required) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const now = new Date(); const access = await AccessRequest.findOneAndUpdate({ tokenHash: hash, status: "approved", revokedAt: null, expiresAt: mongoose.trusted({ $gt: now }), approvedItems: required, useCount: mongoose.trusted({ $lt: 10 }) }, { $inc: { useCount: 1 } }, { new: true });
      if (!access || access.useCount > (access.maxUses || 10)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const bytes = await fileStorage.get("private", key); if (!bytes) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new Response(bytes, { headers: { "Content-Type": asset.mimeType, "Content-Length": String(asset.size), "Content-Disposition": `attachment; filename="${asset.fileName}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" } });
  } catch { return NextResponse.json({ error: "File service unavailable" }, { status: 503 }); }
}




