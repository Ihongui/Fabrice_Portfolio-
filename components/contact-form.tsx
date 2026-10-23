"use client";
import { useState } from "react";
export function ContactForm({ locale }: { locale: string }) {
  const [startedAt] = useState(() => Date.now()); const [status, setStatus] = useState("");
  async function submit(form: FormData) {
    setStatus(locale === "fr" ? "Envoi…" : "Sending…");
    const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), subject: form.get("subject"), message: form.get("message"), website: form.get("website"), startedAt }) });
    setStatus(response.ok ? (locale === "fr" ? "Merci, votre message a été envoyé." : "Thanks, your message has been sent.") : ((await response.json()).error || "Unable to send."));
  }
  return <form action={submit} className="card" style={{ display: "grid", gap: 14 }}><label>{locale === "fr" ? "Nom" : "Name"}<input name="name" autoComplete="name" required maxLength={100}/></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>{locale === "fr" ? "Sujet" : "Subject"}<input name="subject" required maxLength={150}/></label><label>{locale === "fr" ? "Message" : "Message"}<textarea name="message" required minLength={10} maxLength={5000} rows={6}/></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button className="button" type="submit">{locale === "fr" ? "Envoyer" : "Send message"}</button><p aria-live="polite">{status}</p></form>;
}
