"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDemoUser } from "@/lib/devAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const userName = name.trim() || email.split("@")[0] || "Event Browser User";
    saveDemoUser({ id: `demo-${email.toLowerCase()}`, email: email.toLowerCase(), name: userName });
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-sm text-slate-600">Quick demo login to start creating and managing events.</p>
      <input required type="email" className="w-full rounded-md border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-md border p-2" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="w-full rounded-md bg-indigo-600 p-2 text-white">Continue</button>
    </form>
  );
}
