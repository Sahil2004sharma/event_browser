"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getLocalAuthToken, rsvpEvent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import AuthPromptModal from "./AuthPromptModal";

export default function RsvpButton({ eventId }: { eventId: string }) {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const clerkAuth = hasClerk ? useAuth() : null;
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const token = hasClerk ? await clerkAuth?.getToken?.() : getLocalAuthToken();
      if (!token) throw new Error("Please sign in");
      return rsvpEvent(eventId, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
    }
  });

  return (
    <>
      <AuthPromptModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
      <Button
        onClick={async () => {
          const token = hasClerk ? await clerkAuth?.getToken?.() : getLocalAuthToken();
          if (!token) {
            setOpenAuthModal(true);
            return;
          }
          mutation.mutate();
        }}
      >
        {mutation.isPending ? "Joining..." : "RSVP"}
      </Button>
    </>
  );
}
