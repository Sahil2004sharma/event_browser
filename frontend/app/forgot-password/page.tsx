"use client";

import { FormEvent, useState } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await forgotPassword({ email: email.toLowerCase() });
      setStatus(res.message);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to process request.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <p className="text-sm text-slate-600">Enter your email and we will generate a reset link.</p>
      <input required type="email" className="w-full rounded-md border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={loading} className="w-full rounded-md bg-indigo-600 p-2 text-white disabled:opacity-60">
        {loading ? "Please wait..." : "Send Reset Link"}
      </button>
      {status ? <p className="text-sm text-slate-700">{status}</p> : null}
    </form>
  );
}
