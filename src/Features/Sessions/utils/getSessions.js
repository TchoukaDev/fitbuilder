"use server";
import connectDB from "@/libs/mongodb";

const { ObjectId } = require("mongodb");

// Récupère toutes les sessions d'un utilisateur avec filtres (statut, date, workout) et pagination.
// Retourne { sessions: [], pagination: {}, stats: {} }.
export async function getAllSessions(userId, filters = {}) {
  if (!userId) return { sessions: [], pagination: {}, stats: {} };

  const {
    status = "all",
    dateFilter = "all",
    workoutFilter = "all",
    page = 1,
    limit = 20,
  } = filters;

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
      sessions = sessions.filter((s) => s.status === status);
    }

    if (workoutFilter && workoutFilter !== "all") {
      sessions = sessions.filter((s) => s.workoutName === workoutFilter);
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
        sessions = sessions.filter((s) => {
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
    sessions.sort((a, b) => {
      const dateA = new Date(a.completedDate || a.startedAt || a.createdAt);
      const dateB = new Date(b.completedDate || b.startedAt || b.createdAt);
      return dateB - dateA;
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
      completed: allUserSessions.filter((s) => s.status === "completed").length,
      inProgress: allUserSessions.filter((s) => s.status === "in-progress")
        .length,
      planned: allUserSessions.filter((s) => s.status === "planned").length,
    };

    return {
      sessions: sessionsForThisPage,
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
    return { sessions: [], pagination: {}, stats: {} };
  }
}

// Récupère une session spécifique par son ID pour un utilisateur donné.
// Retourne la session avec les ObjectId convertis en strings ou null si non trouvée.
export async function getSessionbyId(userId, sessionId) {
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
    const data = user.sessions.find(
      (session) => session._id.toString() === sessionId,
    );

    if (!data) {
      console.error("❌ Session non trouvée:", sessionId);
      console.log(
        "📋 Sessions disponibles:",
        user.sessions.map((s) => s._id.toString()),
      );
      return null;
    }

    // ✅ Convertir les ObjectId en strings
    const session = {
      ...data,
      _id: data._id.toString(),
      userId: data.userId.toString(),
      workoutId: data.workoutId.toString(),
    };

    return session;
  } catch (error) {
    console.error("❌ Erreur getSessionbyId:", error);
    return null;
  }
}

// Récupère toutes les sessions planifiées
export async function getPlannedSessions(userId) {
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
    const sessions = user.sessions.filter((s) => s.mode === "planned");
    return sessions;
  } catch (error) {
    console.error("❌ Erreur de récupération des sessions planifiées:", error);
    return [];
  }
}
