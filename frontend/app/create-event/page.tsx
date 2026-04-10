"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, getLocalAuthToken } from "@/lib/api";
import AuthPromptModal from "@/components/AuthPromptModal";

export default function CreateEventPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "hobby_meetup",
    dateTime: "",
    location: "",
    address: "",
    lat: "",
    lng: "",
    capacity: "25",
    entryFee: "0",
    prizeDetails: "",
    whatsappNumber: "",
    discordLink: ""
  });
  const [status, setStatus] = useState("");
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedPhone = form.whatsappNumber.trim();
    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      setStatus("Enter correct no.");
      return;
    }
    const normalizedDiscord = form.discordLink.trim();
    if (
      normalizedDiscord &&
      !/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]+$/i.test(normalizedDiscord)
    ) {
      setStatus("Enter correct Discord link.");
      return;
    }

    const token = getLocalAuthToken();
    if (!token) {
      setOpenAuthModal(true);
      return;
    }
    await createEvent(
      {
        ...form,
        dateTime: new Date(form.dateTime).toISOString(),
        lat: Number(form.lat),
        lng: Number(form.lng),
        capacity: Number(form.capacity),
        entryFee: Number(form.entryFee || 0),
        prizeDetails: form.prizeDetails || null,
        whatsappNumber: normalizedPhone || null,
        discordLink: normalizedDiscord || null,
        isPrivate: false
      },
      token
    );
    setStatus("Event created successfully.");
    router.push("/dashboard");
  };

  return (
    <>
      <AuthPromptModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Create and Organize Event</h1>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Event Title</label>
        <input required className="w-full rounded-md border p-2" placeholder="Enter event title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Event Description</label>
        <textarea required className="w-full rounded-md border p-2" placeholder="Describe what this event is about" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Event Category</label>
        <select className="w-full rounded-md border p-2" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
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
        <label className="mb-1 block text-sm font-medium text-slate-700">Event Date & Time</label>
        <input required type="datetime-local" className="w-full rounded-md border p-2" value={form.dateTime} onChange={(e) => setForm((f) => ({ ...f, dateTime: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Location Name</label>
        <input required className="w-full rounded-md border p-2" placeholder="e.g. Town Hall Ground" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Full Address</label>
        <input required className="w-full rounded-md border p-2" placeholder="Enter complete address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
          <input required className="w-full rounded-md border p-2" placeholder="e.g. 22.6763" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
          <input required className="w-full rounded-md border p-2" placeholder="e.g. 85.6289" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Capacity</label>
          <input required className="w-full rounded-md border p-2" placeholder="Max participants" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Entry Fee (Rs)</label>
          <input className="w-full rounded-md border p-2" placeholder="0 for free event" value={form.entryFee} onChange={(e) => setForm((f) => ({ ...f, entryFee: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Prize Details</label>
          <input className="w-full rounded-md border p-2" placeholder="Winner prize, goodies, etc." value={form.prizeDetails} onChange={(e) => setForm((f) => ({ ...f, prizeDetails: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organizer WhatsApp Number</label>
          <input
            inputMode="numeric"
            maxLength={10}
            className="w-full rounded-md border p-2"
            placeholder="10-digit number"
            value={form.whatsappNumber}
            onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value.replace(/\D/g, "") }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organizer Discord Link</label>
          <input
            className="w-full rounded-md border p-2"
            placeholder="https://discord.gg/..."
            value={form.discordLink}
            onChange={(e) => setForm((f) => ({ ...f, discordLink: e.target.value }))}
          />
        </div>
      </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-white">Create Event</button>
        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
    </>
  );
}
