"use client";
import { Dispatch, SetStateAction } from "react";

type Filters = { category: string; search: string; startDate: string; endDate: string; lat: string; lng: string; radiusKm: string; minPrice: string; maxPrice: string; verifiedOnly: boolean };
export default function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: Dispatch<SetStateAction<Filters>> }) {
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFilters((f) => ({
        ...f,
        lat: pos.coords.latitude.toFixed(5),
        lng: pos.coords.longitude.toFixed(5),
        radiusKm: f.radiusKm || "10"
      }));
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-100 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Search events</label>
          <input className="w-full rounded-md border border-slate-200 p-2" placeholder="Marathon, books, football..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
          <select className="w-full rounded-md border border-slate-200 p-2" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
        <option value="">All categories</option>
        <option value="marathon">Marathon</option>
        <option value="sports_tournament">Sports tournament</option>
        <option value="cricket">Cricket</option>
        <option value="ai_hackathon">AI Hackathon</option>
        <option value="book_club">Book club</option>
        <option value="literary_festival">Literary festival</option>
        <option value="hobby_meetup">Hobby meetup</option>
        <option value="music_concert">Music concert</option>
        <option value="group_trip">Group trip</option>
      </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">From date (event start)</label>
          <input type="date" className="w-full rounded-md border border-slate-200 p-2" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">To date (event end range)</label>
          <input type="date" className="w-full rounded-md border border-slate-200 p-2" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input className="w-full rounded-md border border-slate-200 p-2" placeholder="Latitude (e.g. 22.67)" value={filters.lat} onChange={(e) => setFilters((f) => ({ ...f, lat: e.target.value }))} />
        <input className="w-full rounded-md border border-slate-200 p-2" placeholder="Longitude (e.g. 85.62)" value={filters.lng} onChange={(e) => setFilters((f) => ({ ...f, lng: e.target.value }))} />
        <div className="flex gap-2">
          <input className="w-full rounded-md border border-slate-200 p-2" placeholder="Distance radius in km" value={filters.radiusKm} onChange={(e) => setFilters((f) => ({ ...f, radiusKm: e.target.value }))} />
          <button type="button" onClick={useCurrentLocation} className="rounded-md border border-indigo-200 px-3 text-xs text-indigo-600">Use my location</button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input className="w-full rounded-md border border-slate-200 p-2" placeholder="Min price (Rs)" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} />
        <input className="w-full rounded-md border border-slate-200 p-2" placeholder="Max price (Rs)" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} />
        <label className="flex items-center gap-2 rounded-md border border-slate-200 p-2 text-sm text-slate-700">
          <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => setFilters((f) => ({ ...f, verifiedOnly: e.target.checked }))} />
          Verified events only
        </label>
      </div>
      <p className="text-xs text-slate-500">Tip: Add location + radius to discover nearby events only.</p>
    </div>
  );
}
