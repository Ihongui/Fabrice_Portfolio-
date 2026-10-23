import Link from "next/link";
import { getTranslations } from "next-intl/server";

const nav = ["home", "philosophy", "originality", "cv", "projects", "academics", "references", "contact"] as const;
export async function SiteNav({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const hrefs: Record<(typeof nav)[number], string> = { home: "", philosophy: "philosophy", originality: "originality", cv: "cv", projects: "projects", academics: "academics", references: "references", contact: "contact" };
  return <header className="shell nav"><Link className="brand" href={`/${locale}`}>FI<span style={{ color: "#0284c7" }}>.</span></Link><nav className="navlinks" aria-label="Main navigation">{nav.slice(1).map((item) => <Link key={item} href={`/${locale}/${hrefs[item]}`}>{t(item)}</Link>)}<Link className="lang" href={`/${locale === "en" ? "fr" : "en"}`}>{locale === "en" ? "FR" : "EN"}</Link></nav></header>;
}
export async function SiteFooter({ locale }: { locale: string }) { return <footer className="shell footer"><p>© {new Date().getFullYear()} Fabrice Ihongui · Accra, Ghana</p><p>{locale === "fr" ? "Déclaration d’originalité : les travaux présentés sont les miens ou ma contribution est clairement indiquée." : "Statement of originality: work shown is my own or my contribution is clearly identified."}</p><Link href={`/${locale}/privacy`}>{locale === "fr" ? "Confidentialité" : "Privacy"}</Link></footer>; }
export async function PageFrame({ locale, title, children }: { locale: string; title: string; children: React.ReactNode }) { return <><SiteNav locale={locale}/><main className="shell page"><span className="eyebrow">Fabrice Ihongui</span><h1>{title}</h1>{children}</main><SiteFooter locale={locale}/></>; }
