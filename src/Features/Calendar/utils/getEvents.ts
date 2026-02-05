"use server";

import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { getColorByStatus } from "./getColorByStatus";
import { CalendarEvent } from "@/types/calendarEvent";
import { WorkoutSessionDB } from "@/types/workoutSession";
import { unstable_cache } from "next/cache";

async function _getEvents(userId: string): Promise<CalendarEvent[]> {
  const db = await connectDB();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  const sessions = user?.sessions || []

  // Transformer en événements calendrier
  return sessions.map((session: WorkoutSessionDB) => {
    const start = new Date(session.scheduledDate);
    const durationMs = (session.estimatedDuration || 60) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    return {
      id: session._id.toString(),
      title: session.workoutName,
      start: start,
      end: end,
      resource: {
        ...session,
        id: session._id.toString(),
        userId: session.userId,
        workoutId: session.workoutId,
      },
      color: getColorByStatus(session.status).color,
      colorHover: getColorByStatus(session.status).colorHover,
    };
  });
}
export const getEvents = unstable_cache(_getEvents, ["calendarEvents"], { revalidate: 300, tags: ["calendar"] });