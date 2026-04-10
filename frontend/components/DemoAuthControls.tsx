"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuthSession, getAuthUser } from "@/lib/devAuth";
import { getLocalAuthToken, logoutAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

type DemoUser = { id: string; email: string; name: string };

export default function DemoAuthControls() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const onSignOut = async () => {
    const token = getLocalAuthToken();
    if (token) {
      await logoutAuth(token).catch(() => undefined);
    }
    clearAuthSession();
    setUser(null);
    router.refresh();
  };

  if (!user) {
    return (
      <>
        <Link href="/login" className="rounded-md border border-slate-300 px-3 py-1 text-slate-700">
          Sign In
        </Link>
        <Link href="/signup" className="rounded-md bg-indigo-600 px-3 py-1 text-white">
          Sign Up
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="max-w-40 truncate rounded-md border border-slate-300 px-3 py-1 text-slate-700">
        {user.name}
      </span>
      <button type="button" onClick={onSignOut} className="rounded-md border border-slate-300 px-3 py-1 text-slate-700">
        Sign Out
      </button>
    </>
  );
}
