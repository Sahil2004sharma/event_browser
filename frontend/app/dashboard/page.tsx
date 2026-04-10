"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteEvent, getDashboard, getLocalAuthToken, updateEvent } from "@/lib/api";
import AuthPromptModal from "@/components/AuthPromptModal";
import { connectEventStream } from "@/lib/realtime";

export default function DashboardPage() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const queryClient = useQueryClient();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const clerkAuth = hasClerk ? useAuth() : null;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = hasClerk ? await clerkAuth?.getToken?.() : getLocalAuthToken();
      if (!token) {
        return {
          guestMode: true,
          myEvents: [],
          attending: [],
          saved: []
        };
      }
      const dashboard = await getDashboard(token);
      return { guestMode: false, ...dashboard };
    }
  });
  useEffect(() => connectEventStream(queryClient), [queryClient]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-2xl bg-indigo-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-cyan-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-emerald-100" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        We couldn't load your dashboard right now. Please sign in and try again.
      </div>
    );
  }
  const isGuest = Boolean((data as any).guestMode);

  const getTokenForActions = async () => {
    const token = hasClerk ? await clerkAuth?.getToken?.() : getLocalAuthToken();
    if (!token) setOpenAuthModal(true);
    return token;
  };

  const statCards = [
    { label: "Events I Created", value: data.myEvents.length, color: "from-indigo-500 to-blue-500" },
    { label: "Events I am Attending", value: data.attending.length, color: "from-cyan-500 to-sky-500" },
    { label: "Saved Events", value: data.saved.length, color: "from-emerald-500 to-teal-500" }
  ];

  const EventList = ({ title, events }: { title: string; events: any[] }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No events here yet.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {events.map((e: any) => (
            <div key={e.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:shadow">
              <p className="font-medium text-slate-800">{e.title}</p>
              <p className="text-xs text-slate-500">{new Date(e.dateTime).toLocaleString()} • {e.location}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-6">
      <AuthPromptModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          <span className="rounded bg-white/15 px-2 py-1 text-cyan-100">Event Browser</span> Dashboard
        </h1>
        <p className="mt-1 text-sm text-indigo-100">Create, manage, and discover sports and community events in one place.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {isGuest ? (
            <button
              onClick={() => setOpenAuthModal(true)}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700"
            >
              + Create New Event
            </button>
          ) : (
            <Link href="/create-event" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700">+ Create New Event</Link>
          )}
          <Link href="/" className="rounded-md border border-white/50 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            Discover Events
          </Link>
          {isGuest ? (
            <button
              onClick={() => setOpenAuthModal(true)}
              className="rounded-md border border-white/50 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Manage My Existing Events
            </button>
          ) : (
            <a href="#manage-events" className="rounded-md border border-white/50 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              Manage My Existing Events
            </a>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-2xl bg-gradient-to-r ${card.color} p-4 text-white shadow transition hover:scale-[1.02]`}>
            <p className="text-sm text-white/85">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <EventList title="My Organized Events" events={data.myEvents} />
        <EventList title="Events I am Attending" events={data.attending} />
        <EventList title="Saved Events" events={data.saved} />
      </div>

      <section id="manage-events" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Manage Existing Events</h2>
        <p className="mt-1 text-sm text-slate-500">Open your created events and manage details, participants, and updates.</p>
        {data.myEvents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No created events to manage yet.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {data.myEvents.map((e: any) => (
              <div key={`manage-${e.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div>
                  {editingEventId === e.id ? (
                    <input value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)} className="rounded border p-1 text-sm" />
                  ) : (
                    <p className="font-medium text-slate-800">{e.title}</p>
                  )}
                  <p className="text-xs text-slate-500">{new Date(e.dateTime).toLocaleString()} • {e.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/events/${e.id}`} className="rounded-md border border-indigo-200 px-3 py-1 text-sm text-indigo-700">Open Event</Link>
                  {editingEventId === e.id ? (
                    <button
                      onClick={async () => {
                        const token = await getTokenForActions();
                        if (!token) return;
                        await updateEvent(e.id, { title: editTitle }, token);
                        setEditingEventId(null);
                        setEditTitle("");
                        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                      }}
                      className="rounded-md border border-emerald-200 px-3 py-1 text-sm text-emerald-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (isGuest) return setOpenAuthModal(true);
                        setEditingEventId(e.id);
                        setEditTitle(e.title);
                      }}
                      className="rounded-md border border-blue-200 px-3 py-1 text-sm text-blue-700"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const token = await getTokenForActions();
                      if (!token) return;
                      await deleteEvent(e.id, token);
                      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                    }}
                    className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
