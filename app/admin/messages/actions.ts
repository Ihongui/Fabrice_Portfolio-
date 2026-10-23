"use server";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import AuditLog from "@/models/AuditLog";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export async function markRead(form: FormData) {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) throw new Error("Unauthorized");
  const parsed = z.string().regex(/^[a-f\d]{24}$/i).safeParse(form.get("id")); if (!parsed.success) throw new Error("Invalid message id.");
  await connectDb(); const item = await ContactMessage.findByIdAndUpdate(parsed.data, { $set: { read: true } }, { new: true });
  if (item) await AuditLog.create({ actor: session.user.email, action: "contact-message.read", target: String(item._id) });
  revalidatePath("/admin/messages");
}
