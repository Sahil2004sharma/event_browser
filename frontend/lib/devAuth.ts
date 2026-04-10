"use client";

type DemoUser = { id: string; email: string; name: string };

const KEY = "localloop_demo_user";

export function saveDemoUser(user: DemoUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getDemoUser(): DemoUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function clearDemoUser() {
  localStorage.removeItem(KEY);
}

export function getDemoToken() {
  const user = getDemoUser();
  if (!user) return null;
  const encoded = btoa(JSON.stringify(user));
  return `dev:${encoded}`;
}
