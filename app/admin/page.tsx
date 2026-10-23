import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import PageView from "@/models/PageView";
import mongoose from "mongoose";
export default async function AdminPage() {
  const session = await auth(); if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) redirect("/admin/login");
  let visits7 = 0; let visits30 = 0; let downloads = 0; let topPages: Array<{ _id: string; count: number }> = [];
  if (process.env.MONGODB_URI) try { await connectDb(); const now = Date.now(); const week = new Date(now - 7 * 86400000); const month = new Date(now - 30 * 86400000); [visits7, visits30, downloads, topPages] = await Promise.all([PageView.countDocuments({ kind: "page", createdAt: mongoose.trusted({ $gte: week }) }), PageView.countDocuments({ kind: "page", createdAt: mongoose.trusted({ $gte: month }) }), PageView.countDocuments({ kind: "cv_download" }), PageView.aggregate([{ $match: { kind: "page", createdAt: { $gte: month } } }, { $group: { _id: "$path", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }])]); } catch { /* show dashboard even when analytics are unavailable */ }
  const maxPageCount = Math.max(1, ...topPages.map((page) => page.count));
  return <><h1>Portfolio dashboard</h1><p>Welcome, {session.user.name || "Fabrice"}. Edit bilingual text and portfolio records below.</p><section className="section"><h2>Analytics</h2><div className="grid"><div className="card"><strong>Visits · 7 days</strong><p>{visits7}</p></div><div className="card"><strong>Visits · 30 days</strong><p>{visits30}</p></div><div className="card"><strong>CV downloads</strong><p>{downloads}</p></div></div><h3>Top pages · 30 days</h3>{topPages.length ? topPages.map((page) => <div key={page._id} style={{ margin: "12px 0" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span>{page._id}</span><strong>{page.count}</strong></div><div aria-hidden="true" style={{ height: 8, borderRadius: 8, background: "#d5ebf6", marginTop: 5 }}><div style={{ width: `${Math.max(5, Math.round(page.count / maxPageCount * 100))}%`, height: "100%", borderRadius: 8, background: "#0284c7" }}/></div></div>) : <p className="muted">Analytics appear after MongoDB is configured and visits arrive.</p>}</section><div className="grid">
    <section className="card"><h2>Content and sections</h2><p>Edit EN/FR content, visibility, order and JSON fields.</p><Link className="button" href="/admin/content">Open content editor</Link></section>
    <section className="card"><h2>Access requests</h2><p>Review requests, approve limited access or revoke links.</p><Link className="button secondary" href="/admin/requests">Open requests</Link></section>
    <section className="card"><h2>Files and media</h2><p>Upload public portfolio files and private documents.</p><Link className="button secondary" href="/admin/files">Manage files</Link></section>
    <section className="card"><h2>Contact messages</h2><p>Review messages saved to your portfolio database.</p><Link className="button secondary" href="/admin/messages">Open messages</Link></section>
  </div><form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className="button" style={{ marginTop: 20 }}>Sign out</button></form><p><Link href="/en">View public site →</Link></p></>;
}
