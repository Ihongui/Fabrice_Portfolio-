import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://fabrice-ihongui.netlify.app"; return { rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }], sitemap: `${origin}/sitemap.xml` }; }
