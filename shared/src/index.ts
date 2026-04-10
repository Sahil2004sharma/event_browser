export type EventCategory =
  | "marathon"
  | "sports_tournament"
  | "cricket"
  | "ai_hackathon"
  | "book_club"
  | "literary_festival"
  | "hobby_meetup"
  | "music_concert"
  | "group_trip"
  | "other";

export type RsvpStatus = "PENDING" | "CONFIRMED";

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  interests: string[];
  city: string;
  state: string;
  lat?: number | null;
  lng?: number | null;
}

export interface EventDto {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  imageUrl?: string | null;
  dateTime: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  entryFee?: number;
  prizeDetails?: string | null;
  whatsappNumber?: string | null;
  discordLink?: string | null;
  isVerified?: boolean;
  averageRating?: number;
  isPrivate: boolean;
  organizerId: string;
  organizerName?: string;
  participantCount?: number;
  createdAt: string;
}
