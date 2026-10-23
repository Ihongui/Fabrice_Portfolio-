import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), title: { default: "Fabrice Ihongui | Portfolio", template: "%s | Fabrice Ihongui" }, description: "Portfolio of Fabrice Ihongui, IT student and technology professional in Accra, Ghana." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html data-scroll-behavior="smooth"><body>{children}</body></html>; }
