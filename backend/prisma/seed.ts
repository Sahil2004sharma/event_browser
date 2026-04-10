import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@localloop.dev" },
    update: {},
    create: {
      clerkId: "seed-clerk",
      email: "organizer@localloop.dev",
      name: "Event Browser Organizer",
      interests: JSON.stringify(["running", "books", "sports", "travel"]),
      city: "Chakradharpur",
      state: "Jharkhand",
      lat: 22.6763,
      lng: 85.6289,
      isVerifiedOrganizer: true,
      whatsappNumber: "919999999999",
      discordLink: "https://discord.gg/communityevents"
    }
  });

  const categories = ["marathon", "sports_tournament", "cricket", "ai_hackathon", "book_club", "literary_festival", "hobby_meetup", "music_concert", "group_trip"];
  for (let i = 0; i < 10; i++) {
    await prisma.event.create({
      data: {
        title: `Chakradharpur Community Event ${i + 1}`,
        description: "Community-led event for sports, literature, hobbies, and trips.",
        category: categories[i % categories.length],
        imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
        dateTime: new Date(Date.now() + (i + 1) * 86400000),
        location: "Town Hall Ground",
        address: "Main Road, Chakradharpur, Jharkhand",
        lat: 22.6763 + (Math.random() - 0.5) * 0.02,
        lng: 85.6289 + (Math.random() - 0.5) * 0.02,
        capacity: 20 + i * 5,
        entryFee: i % 2 === 0 ? 0 : 99 + i * 10,
        prizeDetails: i % 3 === 0 ? "Winner prize pool Rs 15,000 and trophies." : null,
        whatsappNumber: "919999999999",
        discordLink: "https://discord.gg/communityevents",
        isVerified: true,
        qualityScore: 85,
        isPrivate: i % 3 === 0,
        organizerId: organizer.id
      }
    });
  }
}

main().finally(async () => prisma.$disconnect());
