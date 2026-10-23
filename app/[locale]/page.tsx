import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getContent } from "@/lib/content";

const skills = ["Network troubleshooting", "Project management", "Information security", "Cloud computing", "Python", "JavaScript", "Leadership", "Communication"];
const profileFallback = {
  en: "Strategically minded professional in technology management, known for high productivity and efficient task completion. Skilled in cloud computing, cybersecurity, and project management. Excels at leadership, communication, and problem-solving to navigate complex challenges and drive team success.",
  fr: "Professionnel en technologie de gestion, reconnu pour sa productivité et son efficacité. Compétences en cloud, cybersécurité et gestion de projet. À l'aise en leadership, communication et résolution de problèmes complexes pour contribuer à la réussite des équipes."
};
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "fr" ? "fr" : "en";
  const t = await getTranslations({ locale });
  const h = await getTranslations({ locale, namespace: "home" });
  const profile = await getContent("site.profile");
  const project = await getContent("project.agriprice-gh");
  return <main className="shell">
    <section className="hero"><div className="avatar" role="img" aria-label="Fabrice Ihongui profile photo placeholder">FI</div><span className="eyebrow">{h("eyebrow")}</span><h1>{h("title")}</h1><p className="lead">{h("intro")}</p><div className="buttons"><Link className="button" href={`/${locale}/projects`}>{h("work")}</Link><Link className="button secondary" href={`/${locale}/contact`}>{h("contact")}</Link><Link className="button secondary" href={`/${locale}/cv`}>{t("nav.download")}</Link></div><div className="chips" style={{ marginTop: 34 }}><span className="chip">BSc Information Technology · University of Ghana · 2026</span><span className="chip">Accra, Ghana</span></div></section>
    <section className="section"><h2>{h("about")}</h2><p className="lead">{profile?.body?.[lang] || profileFallback[lang]}</p></section>
    <section className="section"><h2>{h("featured")}</h2><article className="card"><span className="eyebrow">Final-year project · University of Ghana</span><h3>{project?.title?.[lang] || "AgriPrice GH"}</h3><p>{project?.body?.[lang] || (lang === "fr" ? "Une plateforme permettant aux agriculteurs de comparer les prix des cultures sur différents marchés via le web, SMS et USSD." : "A platform that lets farmers compare crop prices across Ghanaian markets through a web app, SMS and USSD.")}</p><p className="muted">React · Node.js · MongoDB Atlas · Africa’s Talking</p><Link className="button" href="https://agripricegh.netlify.app/" target="_blank" rel="noreferrer">{t("common.liveDemo")} ↗</Link></article></section>
    <section className="section"><h2>{h("skills")}</h2><div className="chips">{skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div></section>
    <section className="grid" style={{ marginBottom: 30 }}>{[["philosophy", "philosophy"], ["originality", "originality"], ["academics", "academics"], ["references", "references"]].map(([key, path]) => <Link className="card" key={key} href={`/${locale}/${path}`}><h3>{t(`pages.${key}`)} ↗</h3><p>{t("common.comingSoon")}</p></Link>)}</section>
  </main>;
}
