"use server";

import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { getColorByStatus } from "./getColorByStatus";

export async function getEvents(userId) {
  const db = await connectDB();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  const sessions = user?.sessions || [];

  // Transformer en événements calendrier
  return sessions.map((session) => {
    const start = new Date(session.scheduledDate);
    const durationMs = (session.estimatedDuration || 60) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    return {
      id: session._id,
      title: session.workoutName,
      start: start,
      end: end,
      resource: session,
      color: getColorByStatus(session.status).color,
      colorHover: getColorByStatus(session.status).colorHover,
    };
  });
}
