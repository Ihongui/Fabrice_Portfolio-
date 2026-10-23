import { createElement } from "react";
import { Document, Page, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { listContent } from "@/lib/content";
import { recordView } from "@/lib/analytics";
type Row = { title: { en: string; fr: string }; body: { en: string; fr: string }; data: Record<string, unknown> };
const styles = StyleSheet.create({ page: { padding: 42, fontSize: 10, color: "#132c42", fontFamily: "Helvetica" }, name: { fontSize: 28, marginBottom: 6, color: "#0e2b42" }, heading: { fontSize: 14, marginTop: 20, marginBottom: 8, color: "#0369a1" }, line: { marginBottom: 5, lineHeight: 1.4 }, muted: { color: "#52677a", marginBottom: 8 } });
export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "fr") return NextResponse.json({ error: "Unsupported locale" }, { status: 404 });
  const fr = locale === "fr";
  const [education, experience] = await Promise.all([listContent("education."), listContent("experience.")]);
  const educationRows = (education.length ? education : [
    { title: { en: "Bachelor of Science in Information Technology", fr: "Licence en informatique" }, body: { en: "University of Ghana, Accra", fr: "Université du Ghana, Accra" }, data: { end: "October 2026" } },
    { title: { en: "Système et Réseau (SR)", fr: "Système et Réseau (SR)" }, body: { en: "L'Institut Africain d'Informatique (I.A.I.), Yaoundé", fr: "L'Institut Africain d'Informatique (I.A.I.), Yaoundé" }, data: { end: "October 2020" } },
    { title: { en: "English Language", fr: "Langue anglaise" }, body: { en: "Language Wealth International, Tema", fr: "Language Wealth International, Tema" }, data: { end: "August 2022" } }
  ]) as Row[];
  const experienceRows = (experience.length ? experience : [
    { title: { en: "Assistant IT Manager", fr: "Assistant responsable informatique" }, body: { en: "Solutec Ghana, Accra", fr: "Solutec Ghana, Accra" }, data: { start: "February 2024", end: "May 2024", bulletsEn: ["Trained staff on technology updates.", "Maintained IT inventory and performed device maintenance.", "Implemented data security measures and configured software."], bulletsFr: ["Formé le personnel aux mises à jour technologiques.", "Tenu l'inventaire informatique et assuré la maintenance.", "Mis en place des mesures de sécurité et configuré les logiciels."] } },
    { title: { en: "Intern Lecturer", fr: "Enseignant stagiaire" }, body: { en: "L'Institut Africain d'Informatique, Yaoundé", fr: "L'Institut Africain d'Informatique, Yaoundé" }, data: { start: "June 2020", end: "October 2020", bulletsEn: ["Organized exams and revision week.", "Developed lectures for different learning styles.", "Collaborated with lecturers on course content."], bulletsFr: ["Organisé les examens et la semaine de révision.", "Préparé des cours adaptés à différents styles d'apprentissage.", "Collaboré à la préparation des cours."] } }
  ]) as Row[];
  const section = (name: string, lines: string[]) => [createElement(Text, { key: `${name}-head`, style: styles.heading }, name), ...lines.map((line, i) => createElement(Text, { key: `${name}-${i}`, style: styles.line }, line))];
  const educationLines = educationRows.map((row) => `${row.title[fr ? "fr" : "en"] || row.title.en} — ${row.body[fr ? "fr" : "en"] || row.body.en} (${String(row.data.start || "")} ${String(row.data.end || "")})`);
  const experienceLines = experienceRows.flatMap((row) => [
    `${row.title[fr ? "fr" : "en"] || row.title.en} — ${row.body[fr ? "fr" : "en"] || row.body.en} (${String(row.data.start || "")}–${String(row.data.end || "")})`,
    ...(((fr ? row.data.bulletsFr : row.data.bulletsEn) as string[] | undefined) || []).map((bullet) => `• ${bullet}`)
  ]);
  const doc = createElement(Document, {}, createElement(Page, { size: "A4", style: styles.page },
    createElement(Text, { style: styles.name }, "Fabrice Ihongui"),
    createElement(Text, { style: styles.muted }, "Accra, Ghana  |  ihonguifabrice1@gmail.com"),
    createElement(Text, { style: styles.heading }, fr ? "Profil" : "Profile"),
    createElement(Text, { style: styles.line }, fr ? "Professionnel en technologie de gestion, avec des compétences en cloud, cybersécurité et gestion de projet." : "Technology management professional skilled in cloud computing, cybersecurity, and project management."),
    ...section(fr ? "Formation" : "Education", educationLines),
    ...section(fr ? "Expérience" : "Experience", experienceLines),
    ...section(fr ? "Compétences" : "Skills", ["Network troubleshooting · Project management · Information security · Python · JavaScript · HTML5 · CSS3 · C# · .NET · Leadership · Communication"]),
    ...section(fr ? "Langues" : "Languages", ["French · English · Spanish"])
  ));
  try { const pdf = await renderToBuffer(doc); await recordView(request, `/api/cv/${locale}`, locale, "cv_download"); return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="fabrice-ihongui-cv-${locale}.pdf"`, "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "CV generation is temporarily unavailable" }, { status: 500 }); }
}
