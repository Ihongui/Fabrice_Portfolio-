import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteFooter, SiteNav } from "@/components/site";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
export function generateStaticParams() { return routing.locales.map((locale) => ({ locale })); }
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en"|"fr")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return <NextIntlClientProvider messages={messages}><div lang={locale}><AnalyticsBeacon locale={locale}/><SiteNav locale={locale}/>{children}<SiteFooter locale={locale}/></div></NextIntlClientProvider>;
}
