"use client";

import { QueryClient } from "@tanstack/react-query";

export function connectEventStream(queryClient: QueryClient) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base) return () => undefined;
  const streamUrl = base.replace(/\/api\/v1$/, "/api/v1/events/stream/live");
  const source = new EventSource(streamUrl);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  source.addEventListener("event_created", refresh);
  source.addEventListener("event_updated", refresh);
  source.addEventListener("event_deleted", refresh);
  source.addEventListener("rsvp_updated", refresh);
  source.addEventListener("comment_added", refresh);
  source.addEventListener("review_added", refresh);

  return () => source.close();
}
