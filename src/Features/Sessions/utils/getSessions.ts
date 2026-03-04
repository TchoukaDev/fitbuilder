"use server";
import connectDB from "@/libs/mongodb";
import { SessionDocument } from "@/models/SessionDocument";
import { ObjectId } from "mongodb";
import { WorkoutSession } from "@/types/workoutSession";
import { CompletedSessionType } from "@/types/workoutSession";
import { DEFAULT_SESSION_FILTERS, SessionFiltersType } from "./sessionFilters";
import { unstable_cache } from "next/cache";

interface GetAllSessionsResponse {
  sessions: WorkoutSession[];
  pagination: {
    page: number;
    limit: number;
    totalSessions: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | {};
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    planned: number;
  } | {};
}

function toSession({ _id, userId, workoutId, ...rest }: SessionDocument): WorkoutSession {
  return {
    ...rest,
    id: _id.toString(),
    userId: userId.toString(),
    workoutId: workoutId.toString(),
  };
}

async function _getAllSessions(userId: string, filters: SessionFiltersType): Promise<GetAllSessionsResponse> {
  if (!userId) return { sessions: [], pagination: {}, stats: {} };

  const { status, dateFilter, workoutFilter, page, limit } = { ...DEFAULT_SESSION_FILTERS, ...filters };

  try {
    const db = await connectDB();
    const allDocs = await db
      .collection<SessionDocument>("sessions")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    let sessions = allDocs.map(toSession);

    // ── Filtres ───────────────────────────────────────────────────────────────

    if (status && status !== "all") {
      sessions = sessions.filter((s) => s.status === status);
    }

    if (workoutFilter && workoutFilter !== "all") {
      sessions = sessions.filter((s) => s.workoutName === workoutFilter);
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      let startDate: Date | undefined;

      switch (dateFilter) {
        case "week":    startDate = new Date(now); startDate.setDate(now.getDate() - 7); break;
        case "month":   startDate = new Date(now); startDate.setDate(now.getDate() - 30); break;
        case "quarter": startDate = new Date(now); startDate.setMonth(now.getMonth() - 3); break;
        case "year":    startDate = new Date(now); startDate.setFullYear(now.getFullYear() - 1); break;
      }

      if (startDate) {
        sessions = sessions.filter((s) => {
          const sessionDate = new Date(s.completedDate || s.startedAt || s.scheduledDate || s.createdAt);
          return sessionDate >= startDate!;
        });
      }
    }

    // ── Tri ───────────────────────────────────────────────────────────────────

    sessions.sort((a, b) => {
      const dateA = new Date(a.completedDate || a.scheduledDate || a.startedAt || a.createdAt);
      const dateB = new Date(b.completedDate || b.scheduledDate || b.startedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // ── Pagination ────────────────────────────────────────────────────────────

    const totalSessions = sessions.length;
    const startIndex = (page - 1) * limit;
    const totalPages = Math.ceil(totalSessions / limit);

    // ── Stats (toutes les sessions, sans filtre) ──────────────────────────────

    const allSessions = allDocs.map(toSession);
    const stats = {
      total: allSessions.length,
      completed: allSessions.filter((s) => s.status === "completed").length,
      inProgress: allSessions.filter((s) => s.status === "in-progress").length,
      planned: allSessions.filter((s) => s.status === "planned").length,
    };

    return {
      sessions: sessions.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        totalSessions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats,
    };
  } catch (error) {
    console.error("Erreur getAllSessions:", error);
    return {
      sessions: [],
      pagination: { page: 0, limit: 0, totalSessions: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      stats: { total: 0, completed: 0, inProgress: 0, planned: 0 },
    };
  }
}
export const getAllSessions = unstable_cache(_getAllSessions, ["allSessions"], { revalidate: 300, tags: ["sessions"] });

async function _getSessionbyId(userId: string, sessionId: string): Promise<WorkoutSession | CompletedSessionType | null> {
  try {
    const db = await connectDB();
    const doc = await db
      .collection<SessionDocument>("sessions")
      .findOne({ _id: new ObjectId(sessionId), userId: new ObjectId(userId) });
    if (!doc) return null;
    return toSession(doc);
  } catch (error) {
    console.error("❌ Erreur getSessionbyId:", error);
    return null;
  }
}
export const getSessionbyId = unstable_cache(_getSessionbyId, ["sessionById"], { revalidate: 300, tags: ["sessions"] });

async function _getPlannedSessions(userId: string): Promise<WorkoutSession[]> {
  if (!userId) return [];
  try {
    const db = await connectDB();
    const docs = await db
      .collection<SessionDocument>("sessions")
      .find({ userId: new ObjectId(userId), status: "planned" })
      .toArray();
    return docs.map(toSession);
  } catch (error) {
    console.error("❌ Erreur getPlannedSessions:", error);
    return [];
  }
}
export const getPlannedSessions = unstable_cache(_getPlannedSessions, ["plannedSessions"], { revalidate: 300, tags: ["sessions"] });

async function _getCalendarSessions(userId: string, statusFilter: string | null): Promise<WorkoutSession[]> {
  if (!userId) return [];
  try {
    const db = await connectDB();
    const query: Record<string, unknown> = { userId: new ObjectId(userId) };
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }
    const docs = await db.collection<SessionDocument>("sessions").find(query).toArray();
    return docs.map(toSession);
  } catch (error) {
    console.error("❌ Erreur getCalendarSessions:", error);
    return [];
  }
}
export const getCalendarSessions = unstable_cache(_getCalendarSessions, ["calendarSessions"], { revalidate: 300, tags: ["sessions"] });
