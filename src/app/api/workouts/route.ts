// API Route pour la gestion des plans d'entraînement (création et récupération)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import {
  workoutSchema,
  workoutExercisesSchema,
} from "@/Features/Workouts/utils/workoutSchema";
import { WorkoutRepository } from "@/repositories/WorkoutRepository";
import { WorkoutService } from "@/services/WorkoutService";
import { DuplicateError } from "@/libs/ServicesErrors";

// POST - Créer un nouveau plan d'entraînement
export async function POST(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { name, description, category, estimatedDuration, exercises } =
    await req.json();

  // Validation des champs obligatoires
  const result = workoutSchema.safeParse({
    name,
    description,
    category,
    estimatedDuration,
  });

  let validationErrors = [];
  if (!result.success) {
    validationErrors.push(...result.error.issues.map((issue) => issue.message));
  }

  const resultExercises = workoutExercisesSchema.safeParse({
    exercises,
  });
  if (!resultExercises.success) {
    validationErrors.push(
      ...resultExercises.error.issues.map((issue) => issue.message),
    );
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      ApiError.INVALID_DATA(validationErrors.join(". ")),
      { status: 400 },
    );
  }


  try {
    const db = await connectDB();
    const workoutRepository = new WorkoutRepository(db)
    const workoutService = new WorkoutService(workoutRepository)

    const workout = await workoutService.create(userId, { name, description, category, estimatedDuration, exercises })

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidateTag("workouts");
    return NextResponse.json(
      {
        ...ApiSuccess.CREATED("Plan d'entraînement"),
        workoutId: workout.id,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DuplicateError) return NextResponse.json(ApiError.DUPLICATE("Nom de workout"), { status: 409 })
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer tous les plans d'entraînement de l'utilisateur
export async function GET(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  try {
    const db = await connectDB()
    const workoutRepository = new WorkoutRepository(db)
    const workoutService = new WorkoutService(workoutRepository)

    const workouts = await workoutService.getAll(userId)
    return NextResponse.json(workouts, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération workouts:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
