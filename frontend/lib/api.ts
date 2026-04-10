import type { EventDto } from "@localloop/shared";
import { getDemoToken } from "./devAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) }
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const listEvents = (params: URLSearchParams) => request<EventDto[]>(`/events?${params.toString()}`);
export const getEvent = (id: string) => request<any>(`/events/${id}`);
export const syncAuth = (token: string) => request(`/auth/sync`, { method: "POST" }, token);
export const rsvpEvent = (id: string, token: string) => request(`/events/${id}/rsvp`, { method: "POST" }, token);
export const getDashboard = (token: string) => request<any>(`/users/dashboard`, { method: "GET" }, token);
export const createEvent = (payload: Record<string, unknown>, token: string) => request<EventDto>(`/events`, { method: "POST", body: JSON.stringify(payload) }, token);
export const updateEvent = (id: string, payload: Record<string, unknown>, token: string) =>
  request<EventDto>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
export const deleteEvent = (id: string, token: string) => request<void>(`/events/${id}`, { method: "DELETE" }, token);
export const submitReview = (id: string, payload: { rating: number; text?: string }, token: string) =>
  request(`/events/${id}/reviews`, { method: "POST", body: JSON.stringify(payload) }, token);

export function getLocalAuthToken() {
  return getDemoToken();
}
