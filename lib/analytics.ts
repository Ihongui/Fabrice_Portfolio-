import { createHash } from "node:crypto";
import { connectDb } from "@/lib/db";
import PageView from "@/models/PageView";
export async function recordView(request: Request, path: string, locale: "en" | "fr", kind: "page" | "cv_download" = "page") {
  if (!process.env.MONGODB_URI || request.headers.get("dnt") === "1") return;
  const ip = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
  const now = new Date(); const day = now.toISOString().slice(0, 10); const salt = process.env.ANALYTICS_SALT || process.env.AUTH_SECRET || "local-analytics-salt";
  const visitorHash = createHash("sha256").update(`${ip}:${day}:${salt}`).digest("hex");
  let referrerHost = "";
  try { const referer = request.headers.get("referer"); if (referer) referrerHost = new URL(referer).hostname.slice(0, 253); } catch { /* ignore invalid referrers */ }
  const country = (request.headers.get("x-nf-geo-country") || request.headers.get("x-country") || "").slice(0, 3);
  try { await connectDb(); await PageView.create({ path: path.slice(0, 300), locale, kind, visitorHash, referrerHost, country, createdAt: now }); } catch { /* analytics must not interrupt page views or downloads */ }
}
