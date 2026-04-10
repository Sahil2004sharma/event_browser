"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signupWithEmail, syncAuth } from "@/lib/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await signupWithEmail({ name: name.trim(), email: email.toLowerCase(), password });
      await syncAuth(res.token).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="text-sm text-slate-600">Create your profile and start organizing community events.</p>
      <input required className="w-full rounded-md border p-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <input required type="email" className="w-full rounded-md border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required minLength={8} type="password" className="w-full rounded-md border p-2" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="text-xs text-slate-600">
        Strength:{" "}
        {password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
          ? "Strong"
          : password.length >= 8
            ? "Medium"
            : "Weak"}
      </div>
      <input required minLength={8} type="password" className="w-full rounded-md border p-2" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      <button disabled={loading} className="w-full rounded-md bg-indigo-600 p-2 text-white disabled:opacity-60">{loading ? "Creating..." : "Create Account"}</button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
