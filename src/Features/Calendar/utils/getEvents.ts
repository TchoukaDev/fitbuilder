"use server";

import connectDB from "@/libs/mongodb";
import { SessionDocument } from "@/models/SessionDocument";
import { ObjectId } from "mongodb";
import { getColorByStatus } from "./getColorByStatus";
import { CalendarEvent } from "@/types/calendarEvent";
import { unstable_cache } from "next/cache";

async function _getEvents(userId: string): Promise<CalendarEvent[]> {
  const db = await connectDB();
  const docs = await db
    .collection<SessionDocument>("sessions")
    .find({ userId: new ObjectId(userId) })
    .toArray();

  return docs.map((session) => {
    const start = new Date(session.scheduledDate);
    const durationMs = (session.estimatedDuration || 60) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    return {
      id: session._id.toString(),
      title: session.workoutName,
      start,
      end,
      resource: {
        ...session,
        id: session._id.toString(),
        userId: session.userId.toString(),
        workoutId: session.workoutId.toString(),
      },
      color: getColorByStatus(session.status).color,
      colorHover: getColorByStatus(session.status).colorHover,
    };
  });
}
export const getEvents = unstable_cache(_getEvents, ["calendarEvents"], { revalidate: 300, tags: ["calendar"] });