import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { ObjectId } from "mongodb";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const db = await connectDB();

  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), {
        status: 404,
      });
    }

    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(now);
    endToday.setHours(23, 59, 59, 999);

    const sessions = user?.sessions || [];
    const workouts = user?.workouts || [];

    // ========================================
    // Sessions par statut
    // ========================================
    const completedSessions = sessions.filter((s) => s.status === "completed");
    const plannedSessions = sessions
      .filter((s) => s.status === "planned")
      .map((s) => ({
        ...s,
        scheduledDate: new Date(s.scheduledDate),
      }));

    // ========================================
    // Sessions du jour et à venir
    // ========================================
    const todaySessions = plannedSessions.filter(
      (s) => s.scheduledDate >= startToday && s.scheduledDate <= endToday,
    );

    const nextSessions = plannedSessions
      .filter((s) => s.scheduledDate > endToday)
      .sort((a, b) => a.scheduledDate - b.scheduledDate)
      .slice(0, 3);

    // ========================================
    // Durée totale
    // ========================================
    const sessionsDurationSeconds = completedSessions.map((s) => {
      const [hours, minutes, seconds] = s.duration.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    });

    const totalSessionsDurationSeconds = sessionsDurationSeconds.reduce(
      (acc, curr) => acc + curr,
      0,
    );

    const h = Math.floor(totalSessionsDurationSeconds / 3600);
    const m = Math.floor((totalSessionsDurationSeconds % 3600) / 60);
    const s = totalSessionsDurationSeconds % 60;
    const totalDuration = `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    // ========================================
    // Workout le plus utilisé
    // ========================================
    const favoriteWorkout =
      workouts.length > 0
        ? workouts.sort((a, b) => b.timesUsed - a.timesUsed)[0]
        : null;
    // ========================================
    // Statistiques globales
    // ========================================
    const counts = {
      completed: completedSessions.length,
      inProgress: sessions.filter((s) => s.status === "in-progress").length,
      planned: plannedSessions.length,
      total: sessions.length,
      exercises: user?.exercises?.length || 0,
      workouts: workouts.length,
    };

    // ========================================
    // Streak
    // Règle: si pas de session aujourd'hui mais session hier => streak = 1
    // ========================================

    // Crée une clé jour locale unique pour completedDaysSet, format YYYY-MM-DD (comparer uniquement les jours, ignorer l'heure)
    const dayKeyLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    // Retourne une date fixée à midi local pour éviter les problèmes DST (décalage horaire)
    const atLocalNoon = (date) => {
      const d = new Date(date);
      d.setHours(12, 0, 0, 0);
      return d;
    };

    // -------------------------
    // 1️⃣ Construire l'ensemble des jours "complétés"
    // -------------------------

    const completedDaysSet = new Set(); // contient les jours uniques avec au moins une session complétée
    const todayNoon = atLocalNoon(new Date());

    // Boucle sur toutes les sessions complétées
    for (const session of completedSessions) {
      if (!session?.completedDate) continue; // ignore les sessions sans date

      const sessionDate = new Date(session.completedDate);
      if (Number.isNaN(sessionDate.getTime())) continue; // ignore les dates invalides
      if (atLocalNoon(sessionDate) > todayNoon) continue; // ignore les sessions futures

      // pour chaque session complétée, ajoute le jour unique au Set
      completedDaysSet.add(dayKeyLocal(sessionDate));
    }

    // -------------------------
    // 2️⃣ Déterminer le point de départ du streak
    // -------------------------

    let streak = 0;
    let cursorDate = new Date(todayNoon); // date qu'on va vérifier

    // Si pas de session aujourd'hui, vérifier hier
    if (!completedDaysSet.has(dayKeyLocal(cursorDate))) {
      cursorDate.setDate(cursorDate.getDate() - 1); // recule d'un jour
      if (!completedDaysSet.has(dayKeyLocal(cursorDate))) {
        streak = 0; // ni aujourd'hui ni hier → streak = 0
      }
    }

    // -------------------------
    // 3️⃣ Compter les jours consécutifs
    // -------------------------
    // Boucle sur les jours consécutifs jusqu'à ce que le jour ne soit plus dans le Set (jusqu'à la date la plus ancienne)
    while (completedDaysSet.has(dayKeyLocal(cursorDate))) {
      streak++; // incrémente le streak pour chaque jour consécutif
      cursorDate.setDate(cursorDate.getDate() - 1); // recule d'un jour pour vérifier le jour suivant
    }

    // ========================================
    // Stats du mois
    // ========================================
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sessionsThisMonth = sessions.filter((s) => {
      const date = new Date(s.completedDate || s.scheduledDate);
      return date >= startOfMonth && date <= endOfMonth;
    });

    const monthStats = {
      total: sessionsThisMonth.length,
      completed: sessionsThisMonth.filter((s) => s.status === "completed")
        .length,
      planned: sessionsThisMonth.filter((s) => s.status === "planned").length,
    };

    // ========================================
    // Volume total (séries)
    // ========================================
    const totalSets = completedSessions.reduce((acc, session) => {
      return (
        acc +
        session.exercises.reduce((exAcc, exercise) => {
          return (
            exAcc +
            (exercise.actualSets?.filter((set) => set.completed).length || 0)
          );
        }, 0)
      );
    }, 0);

    // ========================================
    // Volume total (répétitions)
    // ========================================
    const totalReps = completedSessions.reduce((acc, session) => {
      return (
        acc +
        session.exercises.reduce((exAcc, exercise) => {
          return (
            exAcc +
            (exercise.actualSets?.reduce(
              (setAcc, set) => setAcc + (set.reps || 0),
              0,
            ) || 0)
          );
        }, 0)
      );
    }, 0);
    // ========================================
    // Volume total (poids)
    // ========================================
    const totalWeight = completedSessions.reduce((acc, session) => {
      return (
        acc +
        session.exercises.reduce((exAcc, exercise) => {
          return (
            exAcc +
            (exercise.actualSets?.reduce(
              (setAcc, set) => setAcc + (set.weight || 0),
              0,
            ) || 0)
          );
        }, 0)
      );
    }, 0);

    // ========================================
    // Taux de complétion
    // ========================================
    const totalPlannedOrCompleted = sessions.filter(
      (s) => s.status === "completed" || s.status === "planned",
    ).length;

    const completionRate =
      totalPlannedOrCompleted > 0
        ? Math.round((completedSessions.length / totalPlannedOrCompleted) * 100)
        : 0;

    // ========================================
    // Retour
    // ========================================
    return NextResponse.json(
      {
        data: {
          nextSessions,
          todaySessions,
          counts,
          favoriteWorkout,
          totalDuration,
          totalReps,
          totalWeight,
          streak,
          monthStats,
          totalSets,
          totalReps,
          totalWeight,
          completionRate,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur stats:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, {
      status: 500,
      error: error.message,
    });
  }
}
