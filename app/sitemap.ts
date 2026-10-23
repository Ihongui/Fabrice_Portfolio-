import type { MetadataRoute } from "next";

const paths = ["", "philosophy", "originality", "cv", "projects", "in-progress", "academics", "references", "contact", "privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://fabrice-ihongui.netlify.app";
  return paths.flatMap((path) => {
    const route = (locale: string) => `${origin}/${locale}${path ? `/${path}` : ""}`;
    return ["en", "fr"].map((locale) => ({
      url: route(locale),
      alternates: { languages: { en: route("en"), fr: route("fr") } },
    }));
  });
}
