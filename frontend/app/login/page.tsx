"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, syncAuth } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginWithEmail({ email: email.toLowerCase(), password });
      await syncAuth(res.token).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-sm text-slate-600">Sign in with your registered email and password.</p>
      <input required type="email" className="w-full rounded-md border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required minLength={8} type="password" className="w-full rounded-md border p-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
          Forgot password?
        </Link>
      </div>
      <button disabled={loading} className="w-full rounded-md bg-indigo-600 p-2 text-white disabled:opacity-60">{loading ? "Signing in..." : "Continue"}</button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
