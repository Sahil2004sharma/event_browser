"use client";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import FilterBar from "@/components/FilterBar";
import MapView from "@/components/MapView";
import { listEvents } from "@/lib/api";
import { connectEventStream } from "@/lib/realtime";
import { useEffect } from "react";

export default function HomePage() {
  const [filters, setFilters] = useState({ category: "", search: "", startDate: "", endDate: "", lat: "", lng: "", radiusKm: "", minPrice: "", maxPrice: "", verifiedOnly: false });
  const queryClient = useQueryClient();
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.category) p.set("category", filters.category);
    if (filters.search) p.set("search", filters.search);
    if (filters.startDate) p.set("startDate", filters.startDate);
    if (filters.endDate) p.set("endDate", filters.endDate);
    if (filters.lat) p.set("lat", filters.lat);
    if (filters.lng) p.set("lng", filters.lng);
    if (filters.radiusKm) p.set("radiusKm", filters.radiusKm);
    if (filters.minPrice) p.set("minPrice", filters.minPrice);
    if (filters.maxPrice) p.set("maxPrice", filters.maxPrice);
    if (filters.verifiedOnly) p.set("verifiedOnly", "true");
    return p;
  }, [filters]);

  const { data, isLoading, isError } = useQuery({ queryKey: ["events", params.toString()], queryFn: () => listEvents(params) });

  useEffect(() => connectEventStream(queryClient), [queryClient]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
        <div className="hero-float absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20 blur-sm" />
        <div className="hero-float absolute -bottom-10 right-24 h-28 w-28 rounded-full bg-cyan-200/20 blur-sm" />
        <div className="max-w-3xl space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
            Event Browser
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Discover. Connect. Participate.</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Find Local Events Around Your Community</h1>
          <p className="text-sm text-indigo-100 sm:text-base">From marathons and sports tournaments to book clubs and hobby meetups, Event Browser helps you join people nearby.</p>
        </div>
        <div className="mt-4">
          <Link href="/create-event" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700">Create an event</Link>
        </div>
      </section>
      <FilterBar filters={filters} setFilters={setFilters} />
      <MapView events={data ?? []} />
      {isLoading && <p>Loading events...</p>}
      {isError && <p className="text-red-600">Could not load events.</p>}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && <p className="rounded border bg-white p-4">No events found.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(data ?? []).map((event) => <EventCard key={event.id} event={event} />)}</div>
    </div>
  );
}
