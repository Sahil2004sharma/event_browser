"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const email = useMemo(() => params.get("email") ?? "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("");
    if (!token) return setStatus("Missing reset token.");
    if (password !== confirmPassword) return setStatus("Passwords do not match.");
    setLoading(true);
    try {
      const res = await resetPassword({ token, password });
      setStatus(res.message);
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not reset password.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="text-sm text-slate-600">{email ? `Resetting password for ${email}` : "Enter your new password below."}</p>
      <input required minLength={8} type="password" className="w-full rounded-md border p-2" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input required minLength={8} type="password" className="w-full rounded-md border p-2" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      <button disabled={loading} className="w-full rounded-md bg-indigo-600 p-2 text-white disabled:opacity-60">
        {loading ? "Updating..." : "Update Password"}
      </button>
      {status ? <p className="text-sm text-slate-700">{status}</p> : null}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-md p-6 text-center text-slate-600">Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
