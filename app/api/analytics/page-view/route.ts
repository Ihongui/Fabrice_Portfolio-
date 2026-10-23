import { NextResponse } from "next/server";
import { z } from "zod";
import { recordView } from "@/lib/analytics";
const schema = z.object({ path: z.string().startsWith("/").max(300).refine((path) => !path.startsWith("//")), locale: z.enum(["en", "fr"]) }).strict();
export async function POST(request: Request) {
  if (request.headers.get("dnt") === "1") return new Response(null, { status: 204 });
  if (Number(request.headers.get("content-length") || 0) > 1000) return NextResponse.json({ error: "Invalid request." }, { status: 413 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await recordView(request, parsed.data.path, parsed.data.locale);
  return new Response(null, { status: 204 });
}
