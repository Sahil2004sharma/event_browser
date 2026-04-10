import Link from "next/link";
import type { EventDto } from "@localloop/shared";

export default function EventCard({ event }: { event: EventDto }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <p className="inline-block rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium uppercase text-indigo-600">{event.category.replaceAll("_", " ")}</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-800">{event.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>
      <div className="mt-3 text-xs text-slate-500">
        <p>{new Date(event.dateTime).toLocaleString()}</p>
        <p>{event.location}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{event.participantCount ?? 0} joined</span>
        <Link href={`/events/${event.id}`} className="font-semibold text-indigo-600 group-hover:text-indigo-500">View details</Link>
      </div>
    </div>
  );
}
