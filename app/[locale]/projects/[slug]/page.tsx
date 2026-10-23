import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
export default async function ProjectDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params; if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();
  const item = await getContent(`project.${slug}`);
  if (!item && slug !== "agriprice-gh") notFound();
  const lang = locale === "fr" ? "fr" : "en";
  const data = item?.data || {};
  const title = item?.title?.[lang] || "AgriPrice GH";
  const survey = String(data[lang === "fr" ? "surveyFr" : "surveyEn"] || (lang === "fr" ? "Vos commentaires sont utilisés uniquement à des fins universitaires et rapportés de façon anonyme." : "Your feedback is used only for academic purposes and reported anonymously."));
  return <main className="shell page"><span className="eyebrow">Case study · {locale === "fr" ? "En cours" : "In progress"}</span><h1>{title}</h1><section className="section"><p>{item?.body?.[lang] || (locale === "fr" ? "Plateforme de comparaison des prix agricoles en cours de développement." : "Smart market price comparison platform for Ghanaian farmers, currently in development.")}</p><div className="card"><strong>{locale === "fr" ? "Note sur l’enquête" : "Survey note"}</strong><p>{survey}</p></div><h2>{locale === "fr" ? "Problème" : "Problem"}</h2><p>{String(data.problem || "To be completed by Fabrice.")}</p><h2>{locale === "fr" ? "Approche" : "Approach"}</h2><p>{String(data.approach || "To be completed by Fabrice.")}</p><h2>{locale === "fr" ? "Résultat" : "Outcome"}</h2><p>{String(data.outcome || "To be completed by Fabrice.")}</p></section></main>;
}
