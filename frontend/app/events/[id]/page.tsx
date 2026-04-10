"use client";
import { useQuery } from "@tanstack/react-query";
import { getEvent, getLocalAuthToken, submitReview } from "@/lib/api";
import RsvpButton from "@/components/RsvpButton";
import { FormEvent, useMemo, useState } from "react";
import AuthPromptModal from "@/components/AuthPromptModal";

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const { data, isLoading, isError } = useQuery({ queryKey: ["event", params.id], queryFn: () => getEvent(params.id) });
  if (isLoading) return <p>Loading event...</p>;
  if (isError || !data) return <p className="text-red-600">Event not found.</p>;

  const mapUrl = useMemo(() => {
    const lat = Number(data.lat ?? 22.6763);
    const lng = Number(data.lng ?? 85.6289);
    const delta = 0.01;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [data.lat, data.lng]);

  const onSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    const token = getLocalAuthToken();
    if (!token) return setOpenAuthModal(true);
    await submitReview(data.id, { rating: Number(rating), text: reviewText }, token);
    window.location.reload();
  };

  return (
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <AuthPromptModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p>{data.description}</p>
      <p className="text-sm text-slate-600">{new Date(data.dateTime).toLocaleString()}</p>
      <p className="text-sm text-slate-600">{data.location} - {data.address}</p>
      <p className="text-sm text-slate-600">Organizer: {data.organizer?.name}</p>
      <p className="text-sm text-slate-600">Entry Fee: Rs {Number(data.entryFee ?? 0).toFixed(0)}</p>
      <p className="text-sm text-slate-600">Prize Details: {data.prizeDetails || "Not specified"}</p>
      <p className="text-sm text-slate-600">WhatsApp: {data.whatsappNumber || "Not shared"}</p>
      <p className="text-sm text-slate-600">Discord: {data.discordLink ? <a href={data.discordLink} target="_blank" className="text-indigo-600">Join server</a> : "Not shared"}</p>
      <p className="text-sm text-slate-600">Trust: {data.isVerified ? "Verified event" : "Pending verification"} | Rating: {data.averageRating ?? 0}/5</p>
      <p className="text-sm text-slate-600">Participants: {data.rsvps?.length ?? 0} / {data.capacity}</p>
      <RsvpButton eventId={data.id} />
      <div className="overflow-hidden rounded-lg border">
        <iframe title="event-map" src={mapUrl} className="h-64 w-full" loading="lazy" />
      </div>
      <form onSubmit={onSubmitReview} className="space-y-2 rounded-lg border p-3">
        <h3 className="font-semibold">Rate this organizer/event</h3>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="rounded border p-2">
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Very poor</option>
        </select>
        <textarea className="w-full rounded border p-2" placeholder="Share your review..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
        <button className="rounded bg-indigo-600 px-3 py-2 text-sm text-white">Submit Review</button>
      </form>
    </div>
  );
}
