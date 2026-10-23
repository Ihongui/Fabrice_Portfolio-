import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import AccessRequest from "@/models/AccessRequest";
import { approveRequest, denyRequest, revokeRequest } from "./actions";
export default async function RequestsAdmin() {
  const session = await auth(); if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) redirect("/admin/login");
  await connectDb(); const items = await AccessRequest.find().select("+tokenHash").sort({ createdAt: -1 }).limit(100).lean();
  return <><h1>Access requests</h1><p>Review each visitor and the records requested before responding.</p>{items.length ? <div className="grid">{items.map((item) => <article className="card" key={String(item._id)}><h2>{item.name}</h2><p><a href={`mailto:${item.email}`}>{item.email}</a> · {item.organization}</p><p><strong>Requested:</strong> {item.items.join(", ")}</p><p>{item.reason}</p><p>Status: <strong>{item.status}</strong>{item.status === "approved" && ` · ${item.useCount}/${item.maxUses} downloads · expires ${item.expiresAt?.toLocaleDateString()}`}{item.revokedAt && " · revoked"}</p>{item.status === "pending" && <div className="grid"><form action={approveRequest} className="card" style={{display:"grid",gap:10}}><input type="hidden" name="id" value={String(item._id)}/><strong>Approve items</strong>{item.items.map((value: string) => <label key={value}><input type="checkbox" name="items" value={value} defaultChecked/> {value}</label>)}<label>Link expiry<select name="days" defaultValue="14"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select></label><button className="button">Approve and email link</button></form><form action={denyRequest}><input type="hidden" name="id" value={String(item._id)}/><button className="button secondary">Deny</button></form></div>}{item.status === "approved" && !item.revokedAt && <form action={revokeRequest}><input type="hidden" name="id" value={String(item._id)}/><button className="button secondary">Revoke link</button></form>}</article>)}</div> : <section className="section"><p>No access requests yet.</p></section>}<p><Link href="/admin">← Dashboard</Link></p></>;
}

