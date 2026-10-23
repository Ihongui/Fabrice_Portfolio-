import { createHash } from "node:crypto";
import Link from "next/link";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import AccessRequest from "@/models/AccessRequest";
import FileAsset from "@/models/FileAsset";
type AccessRecord = { approvedItems: string[]; expiresAt?: Date; maxUses: number }; type AssetRecord = { _id: unknown; title: string; type: string; size: number; fileKey: string };
const category = (type: string) => type === "transcript" ? "transcript" : type === "reference" ? "references" : ["certificate", "diploma", "award"].includes(type) ? "certificates" : null;
export default async function AccessPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params; if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return <main className="shell page"><h1>Link unavailable</h1><p>This access link is invalid or expired.</p></main>;
  try {
    await connectDb(); const hash = createHash("sha256").update(token).digest("hex"); const now = new Date();
    const request = await AccessRequest.findOne({ tokenHash: hash, status: "approved", revokedAt: null, expiresAt: mongoose.trusted({ $gt: now }), useCount: mongoose.trusted({ $lt: 10 }) }).select("+tokenHash").lean<AccessRecord>();
    if (!request) return <main className="shell page"><h1>{locale === "fr" ? "Lien indisponible" : "Link unavailable"}</h1><p>{locale === "fr" ? "Ce lien est invalide, expiré ou révoqué." : "This link is invalid, expired, or revoked."}</p></main>;
    const permitted = request.approvedItems || []; const assets = await FileAsset.find({ visibility: "on_request", type: mongoose.trusted({ $in: ["transcript", "reference", "certificate", "diploma", "award"] }) }).sort({ title: 1 }).lean<AssetRecord[]>();
    const available = assets.filter((asset) => category(asset.type) && permitted.includes(category(asset.type)!));
    return <main className="shell page"><span className="eyebrow">{locale === "fr" ? "Accès privé" : "Private access"}</span><h1>{locale === "fr" ? "Documents autorisés" : "Approved documents"}</h1><p>{locale === "fr" ? `Ce lien expire le ${request.expiresAt?.toLocaleDateString("fr-FR")}. Chaque téléchargement consomme une utilisation.` : `This link expires ${request.expiresAt?.toLocaleDateString("en-GB")}. Each download uses one of ${request.maxUses} uses.`}</p>{available.length ? <div className="grid">{available.map((asset) => <article className="card" key={String(asset._id)}><h2>{asset.title}</h2><p>{asset.type} · {(asset.size / 1024 / 1024).toFixed(2)} MB</p><Link className="button" href={`/api/files/private/${asset.fileKey}?token=${encodeURIComponent(token)}`}>{locale === "fr" ? "Télécharger" : "Download"}</Link></article>)}</div> : <p>{locale === "fr" ? "Aucun document n’est disponible pour les catégories approuvées." : "No documents are currently available for the approved categories."}</p>}</main>;
  } catch { return <main className="shell page"><h1>{locale === "fr" ? "Service indisponible" : "Service unavailable"}</h1><p>{locale === "fr" ? "Veuillez réessayer plus tard." : "Please try again later."}</p></main>; }
}




