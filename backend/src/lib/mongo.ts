import mongoose from "mongoose";
import { env } from "./env";

let hasConnected = false;

export async function connectMongo() {
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set, skipping MongoDB connection");
    return;
  }

  if (hasConnected) return;

  await mongoose.connect(env.MONGODB_URI);
  hasConnected = true;
  console.log("MongoDB connected");
}
