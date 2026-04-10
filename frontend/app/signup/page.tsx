"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDemoUser } from "@/lib/devAuth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveDemoUser({ id: `demo-${email.toLowerCase()}`, email: email.toLowerCase(), name: name.trim() });
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="text-sm text-slate-600">Create your profile and start organizing community events.</p>
      <input required className="w-full rounded-md border p-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <input required type="email" className="w-full rounded-md border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="w-full rounded-md bg-indigo-600 p-2 text-white">Create Account</button>
    </form>
  );
}
