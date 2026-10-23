import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { createHash } from "node:crypto";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { connectDb } from "./lib/db";
import RateLimit from "./models/RateLimit";
const credentialsSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(256) }).strict();
export const { handlers, auth, signIn, signOut } = NextAuth({ ...authConfig, providers: [Credentials({ credentials: { email: {}, password: { type: "password" } }, async authorize(raw) {
  const parsed = credentialsSchema.safeParse({ email: raw?.email, password: raw?.password });
  const email = process.env.ADMIN_EMAIL?.toLowerCase(); const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!parsed.success || !email || !hash || parsed.data.email.toLowerCase() !== email) return null;
  try {
    await connectDb();
    const key = `login:${createHash("sha256").update(email).digest("hex")}`;
    const now = new Date();
    let attempts = await RateLimit.findOne({ key }).lean().exec() as unknown as { expiresAt: Date; count: number } | null;
    if (attempts && attempts.expiresAt <= now) { await RateLimit.deleteOne({ key }); attempts = null; }
    if (attempts && attempts.count >= 5) return null;
    if (await argon2.verify(hash, parsed.data.password)) {
      await RateLimit.deleteOne({ key });
      return { id: email, email, name: "Fabrice Ihongui" };
    }
    if (attempts) await RateLimit.updateOne({ key }, { $inc: { count: 1 } });
    else await RateLimit.create({ key, count: 1, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
    return null;
  } catch { return null; }
} })] });

