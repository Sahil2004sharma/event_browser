"use client";

import { useEffect, useMemo, useState } from "react";

function resolveHealthUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")}/health`;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8080/health`;
  }
  return "http://localhost:8080/health";
}

export default function ApiStatusBanner() {
  const [online, setOnline] = useState(true);
  const healthUrl = useMemo(() => resolveHealthUrl(), []);

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const res = await fetch(healthUrl, { method: "GET" });
        if (!active) return;
        setOnline(res.ok);
      } catch {
        if (!active) return;
        setOnline(false);
      }
    };

    check().catch(() => undefined);
    const id = setInterval(() => check().catch(() => undefined), 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [healthUrl]);

  if (online) return null;

  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700">
      Backend disconnected. Start backend on port 8080.
    </div>
  );
}
