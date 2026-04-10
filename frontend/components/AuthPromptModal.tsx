"use client";
import Link from "next/link";

export default function AuthPromptModal({
  open,
  onClose,
  title = "Sign in to continue",
  message = "Please sign in or create an account to use this feature."
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-4 flex items-center gap-2">
          <Link href="/login" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">Sign In</Link>
          <Link href="/signup" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white">Sign Up</Link>
          <button onClick={onClose} className="ml-auto text-sm text-slate-500 hover:text-slate-700">Close</button>
        </div>
      </div>
    </div>
  );
}
