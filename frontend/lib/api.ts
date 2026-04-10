import type { EventDto } from "@localloop/shared";
import { getAuthToken, saveAuthSession } from "./devAuth";

function resolveApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    // Use the same host as the frontend so local LAN/mobile testing works too.
    return `http://${window.location.hostname}:8080/api/v1`;
  }
  return "http://localhost:8080/api/v1";
}

const API_URL = resolveApiUrl();

async function errorMessageFromResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as {
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };
    if (typeof json.message === "string" && json.message.trim()) return json.message;
    const desc = json.fieldErrors?.description?.[0];
    if (desc) return desc;
    for (const msgs of Object.values(json.fieldErrors ?? {})) {
      const first = msgs?.[0];
      if (first) return first;
    }
    const formErr = json.formErrors?.find(Boolean);
    if (formErr) return formErr;
  } catch {
    /* not JSON */
  }
  return text.trim() || `Request failed (${res.status})`;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) }
    });
  } catch {
    throw new Error("Unable to reach API server. Make sure backend is running on http://localhost:8080.");
  }
  if (!res.ok) throw new Error(await errorMessageFromResponse(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const listEvents = (params: URLSearchParams) => request<EventDto[]>(`/events?${params.toString()}`);
export const getEvent = (id: string) => request<any>(`/events/${id}`);
export const syncAuth = (token: string) => request(`/auth/sync`, { method: "POST" }, token);
export const logoutAuth = (token: string) => request<void>(`/auth/logout`, { method: "POST" }, token);
export const rsvpEvent = (id: string, token: string) => request(`/events/${id}/rsvp`, { method: "POST" }, token);
export const getDashboard = (token: string) => request<any>(`/users/dashboard`, { method: "GET" }, token);
export const createEvent = (payload: Record<string, unknown>, token: string) => request<EventDto>(`/events`, { method: "POST", body: JSON.stringify(payload) }, token);
export const updateEvent = (id: string, payload: Record<string, unknown>, token: string) =>
  request<EventDto>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
export const deleteEvent = (id: string, token: string) => request<void>(`/events/${id}`, { method: "DELETE" }, token);
export const submitReview = (id: string, payload: { rating: number; text?: string }, token: string) =>
  request(`/events/${id}/reviews`, { method: "POST", body: JSON.stringify(payload) }, token);

type AuthResponse = { token: string; user: { id: string; email: string; name: string } };
export async function signupWithEmail(payload: { name: string; email: string; password: string }) {
  const res = await request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(payload) });
  saveAuthSession(res.token, res.user);
  return res;
}

export async function loginWithEmail(payload: { email: string; password: string }) {
  const res = await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  saveAuthSession(res.token, res.user);
  return res;
}

export async function forgotPassword(payload: { email: string }) {
  return request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) });
}

export function getLocalAuthToken() {
  return getAuthToken();
}
