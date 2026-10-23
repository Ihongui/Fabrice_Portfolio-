"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
export function AnalyticsBeacon({ locale }: { locale: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1") return;
    void fetch("/api/analytics/page-view", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: pathname, locale }), keepalive: true }).catch(() => undefined);
  }, [locale, pathname]);
  return null;
}
