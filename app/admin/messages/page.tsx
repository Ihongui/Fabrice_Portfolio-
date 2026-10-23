import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { markRead } from "./actions";
export default async function MessagesAdmin() {
  const session = await auth(); if (!session?.user) redirect("/admin/login");
  await connectDb(); const items = await ContactMessage.find().sort({ createdAt: -1 }).limit(100).lean();
  return <><h1>Contact messages</h1>{items.length ? <div className="grid">{items.map((item) => <article className="card" key={String(item._id)}><h2>{item.subject}</h2><p><a href={`mailto:${item.email}`}>{item.name} · {item.email}</a></p><p>{item.message}</p><p>{item.read ? "Read" : "Unread"}</p>{!item.read && <form action={markRead}><input type="hidden" name="id" value={String(item._id)}/><button className="button secondary">Mark read</button></form>}</article>)}</div> : <section className="section"><p>No messages yet.</p></section>}<p><Link href="/admin">← Dashboard</Link></p></>;
}
