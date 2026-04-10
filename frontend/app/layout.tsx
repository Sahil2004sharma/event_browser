import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/lib/providers";
import AuthSync from "@/components/AuthSync";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Event Browser",
  description: "Organize and discover local community events"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return (
      <html lang="en">
        <body>
          <Providers>
            <AuthSync />
            <header className="border-b bg-white">
              <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-xl font-semibold">
                  <span className="brand-orb" />
                  <span className="brand-title">Event Browser</span>
                </Link>
                <div className="flex items-center gap-2 text-xs">
                  <ThemeToggle />
                  <Link href="/dashboard" className="rounded-md border border-slate-300 px-3 py-1 text-slate-700">Dashboard</Link>
                  <Link href="/create-event" className="rounded-md border border-slate-300 px-3 py-1 text-slate-700">Create Event</Link>
                  <Link href="/login" className="rounded-md border border-slate-300 px-3 py-1 text-slate-700">Sign In</Link>
                  <Link href="/signup" className="rounded-md bg-indigo-600 px-3 py-1 text-white">Sign Up</Link>
                </div>
              </nav>
            </header>
            <main className="mx-auto max-w-6xl p-4">{children}</main>
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>
            <header className="border-b bg-white">
              <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-xl font-semibold">
                  <span className="brand-orb" />
                  <span className="brand-title">Event Browser</span>
                </Link>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
                  <Link href="/create-event" className="text-sm hover:underline">Create Event</Link>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700">Sign In</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white">Sign Up</button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <AuthSync />
                    <UserButton />
                  </SignedIn>
                </div>
              </nav>
            </header>
            <main className="mx-auto max-w-6xl p-4">{children}</main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
