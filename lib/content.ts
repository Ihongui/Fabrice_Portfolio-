import { connectDb } from "@/lib/db";
import mongoose from "mongoose";
import Content from "@/models/Content";
export type Localized = { en: string; fr: string };
export async function getContent(key: string): Promise<{ key: string; title: Localized; body: Localized; visible: boolean; order: number; data: Record<string, unknown> } | null> {
  if (!process.env.MONGODB_URI) return null;
  await connectDb();
  const item = await Content.findOne({ key, visible: true }).lean();
  return item ? JSON.parse(JSON.stringify(item)) as { key: string; title: Localized; body: Localized; visible: boolean; order: number; data: Record<string, unknown> } : null;
}
export async function listContent(prefix: string) {
  if (!/^[a-z0-9._-]+$/.test(prefix) || !process.env.MONGODB_URI) return [];
  await connectDb();
  const items = await Content.find({ key: mongoose.trusted({ $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` }), visible: true }).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(items)) as Array<{ key: string; title: Localized; body: Localized; visible: boolean; order: number; data: Record<string, unknown> }>;
}
