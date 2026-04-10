import type { EventDto } from "@localloop/shared";

export default function MapView({ events }: { events: EventDto[] }) {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-slate-800">Map View</h3>
      <p className="text-sm text-slate-600">Map markers area for event pins (Mapbox/Leaflet). Loaded events: <span className="font-semibold text-cyan-700">{events.length}</span></p>
    </div>
  );
}
