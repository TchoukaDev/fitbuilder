// API Route pour la gestion des séances d'entraînement (création et récupération avec filtres/pagination)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { getAllSessions } from "@/Features/Sessions/utils";
import { WorkoutExercise } from "@/types/workoutExercise";

// POST - Démarrer une nouvelle séance à partir d'un plan d'entraînement
export async function POST(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const {
    workoutId,
    workoutName,
    exercises,
    scheduledDate,
    estimatedDuration,
    isPlanning,
  } = await req.json();

  // Validation
  if (!workoutId || !workoutName || exercises.length === 0) {
    return NextResponse.json(
      ApiError.INVALID_DATA(
        "La session doit être liée à un entraînement et contenir au moins un exercice",
      ),
      { status: 400 },
    );
  }

  const db = await connectDB();

  try {
    // Initialiser les exercices pour la nouvelle séance
    const sessionExercises = exercises.map((ex: WorkoutExercise) => ({
      exerciseId: ex.exerciseId, // exerciseId vient de WorkoutExercise
      exerciseName: ex.name,
      order: ex.order,
      targetSets: ex.sets,
      targetReps: ex.reps,
      targetWeight: ex.targetWeight,
      restTime: ex.restTime || 90,
      // Initialiser les séries avec valeurs vides
      actualSets: Array.from({ length: ex.sets }).map(() => ({
        reps: null,
        weight: ex.targetWeight,
        completed: false,
      })),
      notes: "",
      effort: null,
      completed: false,
    }));

    const sessionId = new ObjectId();

    const newSession = {
      _id: sessionId,
      userId: new ObjectId(userId),
      workoutId: new ObjectId(workoutId),
      workoutName: workoutName,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      status: isPlanning ? "planned" : "in-progress",
      isPlanned: isPlanning,
      startedAt: isPlanning ? null : new Date(),
      completedDate: null,
      estimatedDuration: estimatedDuration || 60,
      exercises: sessionExercises,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ MODIFICATION : Incrémenter timesUsed SEULEMENT si démarrage immédiat
    const updateQuery: any = isPlanning
      ? {
        $push: { sessions: newSession }, // Planification : juste ajouter
      }
      : {
        $inc: { "workouts.$[workout].timesUsed": 1 }, // Démarrage : incrémenter
        $set: { "workouts.$[workout].lastUsedAt": new Date() },
        $push: { sessions: newSession },
      };

    const options = isPlanning ? {} : { arrayFilters: [{ "workout._id": new ObjectId(workoutId) }] };


    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, updateQuery, options);

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        success: true,
        sessionId: sessionId.toString(),
        message: isPlanning
          ? "Séance planifiée avec succès"
          : "Séance démarrée avec succès",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur création session:", error);
    return NextResponse.json(
      { error: "Erreur lors du démarrage de la séance" },
      { status: 500 },
    );
  }
}

// GET - Récupérer les séances avec filtres (statut, date, workout) et pagination
export async function GET(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  // Extraction des paramètres d'URL
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "all";
  const dateFilter = searchParams.get("dateFilter") || "all";
  const workoutFilter = searchParams.get("workoutFilter") || "all";

  try {
    // ✅ Utilise le helper qui fait tout : filtres, pagination, stats, transformation ObjectId → string
    const result = await getAllSessions(userId, {
      page,
      limit,
      status,
      dateFilter,
      workoutFilter,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erreur GET sessions:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la récupération des sessions",
      },
      { status: 500 },
    );
  }
}
