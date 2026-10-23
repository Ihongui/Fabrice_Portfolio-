import { ContactForm } from "@/components/contact-form";
import { getTranslations } from "next-intl/server";
export default async function Contact({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; const t = await getTranslations({ locale }); return <main className="shell page"><span className="eyebrow">{t("pages.contact")}</span><h1>{locale === "fr" ? "Parlons de votre projet." : "Let’s talk about your project."}</h1><p><a href="mailto:ihonguifabrice1@gmail.com">ihonguifabrice1@gmail.com</a> · Accra, Ghana</p><ContactForm locale={locale}/></main>; }
