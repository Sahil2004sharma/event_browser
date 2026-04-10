"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { getLocalAuthToken, syncAuth } from "@/lib/api";

export default function AuthSync() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const auth = hasClerk ? useAuth() : null;
  const user = hasClerk ? useUser() : null;

  useEffect(() => {
    const run = async () => {
      const token = hasClerk ? await auth?.getToken?.() : getLocalAuthToken();
      if (!token) return;
      await syncAuth(token);
    };
    run().catch(() => undefined);
  }, [auth, hasClerk, user]);

  return null;
}
