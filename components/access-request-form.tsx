"use client";
import { useState } from "react";
export function AccessRequestForm({ locale }: { locale: string }) {
  const [status, setStatus] = useState("");
  async function submit(form: FormData) {
    setStatus(locale === "fr" ? "Envoi…" : "Sending…");
    const items = form.getAll("items");
    const response = await fetch("/api/access/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), organization: form.get("organization"), reason: form.get("reason"), items }) });
    const result = await response.json();
    setStatus(response.ok ? (locale === "fr" ? "Demande envoyée. Merci." : "Request sent. Thank you.") : result.error || "Unable to submit.");
  }
  return <form action={submit} className="card" style={{ display: "grid", gap: 14 }}><label>{locale === "fr" ? "Nom" : "Name"}<input name="name" required maxLength={100}/></label><label>Email<input name="email" type="email" required maxLength={254}/></label><label>{locale === "fr" ? "Organisation" : "Organization"}<input name="organization" required maxLength={160}/></label><fieldset><legend>{locale === "fr" ? "Documents souhaités" : "Items requested"}</legend>{["transcript", "references", "certificates"].map((item) => <label key={item}><input type="checkbox" name="items" value={item}/>{locale === "fr" ? ({ transcript: "Relevé de notes", references: "Références", certificates: "Certificats" } as Record<string,string>)[item] : item[0].toUpperCase() + item.slice(1)}</label>)}</fieldset><label>{locale === "fr" ? "Motif" : "Reason for request"}<textarea name="reason" required minLength={10} maxLength={2000} rows={5}/></label><button className="button">{locale === "fr" ? "Envoyer la demande" : "Submit request"}</button><p aria-live="polite">{status}</p></form>;
}
