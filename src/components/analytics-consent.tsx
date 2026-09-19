"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "analytics_consent";
const VISITOR_KEY = "visitor_id";
const CONSENT_VALUE = "accepted";
const REJECTED_VALUE = "rejected";

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getOrCreateVisitorId(): string {
  const existing = getCookie(VISITOR_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  setCookie(VISITOR_KEY, id, 365);
  return id;
}

function sendPageView(path: string) {
  const visitorId = getOrCreateVisitorId();
  const body = JSON.stringify({ path, visitorId });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/track", body);
  } else {
    fetch("/api/analytics/track", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  }
}

export function AnalyticsConsent() {
  const [show, setShow] = useState(false);
  const [consented, setConsented] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const value = getCookie(CONSENT_KEY);
    if (!value) {
      setShow(true);
      return;
    }
    setConsented(value === CONSENT_VALUE);
  }, []);

  useEffect(() => {
    if (!consented || !pathname) return;
    sendPageView(pathname);
  }, [consented, pathname]);

  function accept() {
    setCookie(CONSENT_KEY, CONSENT_VALUE, 365);
    setConsented(true);
    setShow(false);
    sendPageView(pathname);
  }

  function reject() {
    setCookie(CONSENT_KEY, REJECTED_VALUE, 365);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Kami menggunakan cookies untuk menganalisis traffic situs. Data Anda
          tidak dibagikan ke pihak ketiga.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={reject}>
            Tolak
          </Button>
          <Button size="sm" onClick={accept}>
            Terima
          </Button>
        </div>
      </div>
    </div>
  );
}
