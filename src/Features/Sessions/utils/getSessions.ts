"use server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { WorkoutSession, WorkoutSessionDB } from "@/types/workoutSession";
import { CompletedSessionType } from "@/types/workoutSession";
import { DEFAULT_SESSION_FILTERS, SessionFiltersType } from "../hooks/useSessions";

// Récupère toutes les sessions d'un utilisateur avec filtres (statut, date, workout) et pagination.
// Retourne { sessions: [], pagination: {}, stats: {} }.

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

export async function getAllSessions(userId: string, filters: SessionFiltersType): Promise<GetAllSessionsResponse> {
  if (!userId) return { sessions: [], pagination: {}, stats: {} };

  const {
    status,
    dateFilter,
    workoutFilter,
    page,
    limit,
  } = { ...DEFAULT_SESSION_FILTERS, ...filters };


  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return { sessions: [], pagination: {}, stats: {} };
    }

    let sessions = user?.sessions || [];

    // ═══════════════════════════════════════════════════════
    // 🔍 FILTRE PAR STATUT
    // ═══════════════════════════════════════════════════════
    if (status && status !== "all") {
      sessions = sessions.filter((s: WorkoutSessionDB) => s.status === status);
    }

    if (workoutFilter && workoutFilter !== "all") {
      sessions = sessions.filter((s: WorkoutSessionDB) => s.workoutName === workoutFilter);
    }

    // ═══════════════════════════════════════════════════════
    // 🔍 FILTRE PAR DATE
    // ═══════════════════════════════════════════════════════
    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      let startDate;

      switch (dateFilter) {
        case "week":
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate = new Date();
          startDate.setDate(now.getDate() - 30);
          break;
        case "quarter":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (startDate) {
        sessions = sessions.filter((s: WorkoutSessionDB) => {
          const sessionDate = new Date(
            s.completedDate || s.startedAt || s.scheduledDate || s.createdAt,
          );
          return sessionDate >= startDate;
        });
      }
    }

    // ═══════════════════════════════════════════════════════
    // 📊 TRIER
    // ═══════════════════════════════════════════════════════
    sessions.sort((a: WorkoutSessionDB, b: WorkoutSessionDB) => {
      const dateA = new Date(a.completedDate || a.scheduledDate || a.startedAt || a.createdAt);
      const dateB = new Date(b.completedDate || b.scheduledDate || b.startedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // ═══════════════════════════════════════════════════════
    // 📄 PAGINATION
    // ═══════════════════════════════════════════════════════
    const totalSessions = sessions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const sessionsForThisPage = sessions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalSessions / limit);

    // ═══════════════════════════════════════════════════════
    // 📈 STATS (toutes les sessions user)
    // ═══════════════════════════════════════════════════════
    const allUserSessions = user?.sessions || [];
    const stats = {
      total: allUserSessions.length,
      completed: allUserSessions.filter((s: WorkoutSessionDB) => s.status === "completed").length,
      inProgress: allUserSessions.filter((s: WorkoutSessionDB) => s.status === "in-progress")
        .length,
      planned: allUserSessions.filter((s: WorkoutSessionDB) => s.status === "planned").length,
    };

    // Convertir _id en id pour l'application
    const formattedSessions = sessionsForThisPage.map(({ _id, userId, workoutId, ...session }: WorkoutSessionDB) => ({
      ...session,
      id: _id.toString(),
      userId: userId.toString(),
      workoutId: workoutId?.toString(),
    }));


    return {
      sessions: formattedSessions,
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
    return { sessions: [], pagination: { page: 0, limit: 0, totalSessions: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }, stats: { total: 0, completed: 0, inProgress: 0, planned: 0 } };
  }
}

// Récupère une session spécifique par son ID pour un utilisateur donné.
// Retourne la session avec les ObjectId convertis en strings ou null si non trouvée.


export async function getSessionbyId(userId: string, sessionId: string): Promise<WorkoutSession | CompletedSessionType | null> {
  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      console.error("❌ Utilisateur non trouvé:", userId);
      return null;
    }

    if (!user.sessions || user.sessions.length === 0) {
      console.error("❌ Aucune session pour cet utilisateur");
      return null;
    }

    // ✅ Trouver la bonne session
    const data: WorkoutSessionDB | undefined = user.sessions.find(
      (session: WorkoutSessionDB) => session._id.toString() === sessionId,
    );

    if (!data) {
      console.error("❌ Session non trouvée:", sessionId);

      return null;
    }

    // ✅ Convertir les ObjectId en strings et _id en id

    const { _id, ...sessionData }: WorkoutSessionDB = data;
    return {
      ...sessionData,
      id: _id.toString(),
      userId: data.userId.toString(),
      workoutId: data.workoutId.toString(),
    };
  } catch (error) {
    console.error("❌ Erreur getSessionbyId:", error);
    return null;
  }
}

// Récupère toutes les sessions planifiées
export async function getPlannedSessions(userId: string): Promise<WorkoutSession[]> {
  if (!userId) return [];
  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      console.error("❌ Utilisateur non trouvé:", userId);
      return [];
    }
    const sessions = user.sessions.filter((s: WorkoutSessionDB) => s.status === "planned");
    // Convertir _id en id pour l'application


    return sessions.map(({ _id, userId, workoutId, ...session }: WorkoutSessionDB) => ({
      ...session,
      id: _id.toString(),
      userId: userId.toString(),
      workoutId: workoutId.toString(),
    }));
  } catch (error) {
    console.error("❌ Erreur de récupération des sessions planifiées:", error);
    return [];
  }
}

// Récupère les sessions pour le calendrier (toutes ou filtrées par statut)
export async function getCalendarSessions(userId: string, statusFilter: string | null): Promise<WorkoutSession[]> {
  if (!userId) return [];

  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      console.error("❌ Utilisateur non trouvé:", userId);
      return [];
    }

    let sessions = user?.sessions || [];

    // Filtrer par statut si fourni
    if (statusFilter && statusFilter !== "all") {
      sessions = sessions.filter((s: WorkoutSessionDB) => s.status === statusFilter);
    }

    // Convertir _id en id pour l'application
    return sessions.map(({ _id, userId, workoutId, ...session }: WorkoutSessionDB) => ({
      ...session,
      id: _id.toString(),
      userId: userId.toString(),
      workoutId: workoutId.toString(),
    }));
  } catch (error) {
    console.error("❌ Erreur getCalendarSessions:", error);
    return [];
  }
}