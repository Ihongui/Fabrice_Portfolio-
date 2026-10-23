import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import FileAsset from "@/models/FileAsset";
import { fileStorage } from "@/lib/storage";
type AssetRecord = { mimeType: string; size: number; fileName: string };
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params; const key = segments.join("/");
  if (!/^[a-f\d-]{36}\.(pdf|png|jpg|webp)$/.test(key)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await connectDb(); const asset = await FileAsset.findOne({ fileKey: key, visibility: "public" }).lean<AssetRecord>();
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const bytes = await fileStorage.get("public", key); if (!bytes) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new Response(bytes, { headers: { "Content-Type": asset.mimeType, "Content-Length": String(asset.size), "Content-Disposition": `inline; filename="${asset.fileName}"`, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return NextResponse.json({ error: "File service unavailable" }, { status: 503 }); }
}




