// API Route pour les opérations sur un plan d'entraînement spécifique (modification et suppression)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import {
  workoutExercisesSchema,
  workoutSchema,
} from "@/Features/Workouts/utils/workoutSchema";
import { WorkoutRepository } from "@/repositories/WorkoutRepository";
import { WorkoutService } from "@/services/WorkoutService";
import { DuplicateError, NotFoundError } from "@/libs/ServicesErrors";

// GET - Récupérer un plan d'entraînement par ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id: workoutId } = await params;

  try {
    const db = await connectDB();
    const service = new WorkoutService(new WorkoutRepository(db));
    const workout = await service.getById(userId, workoutId);
    return NextResponse.json(workout, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) return NextResponse.json(ApiError.NOT_FOUND("Workout"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// DELETE - Supprimer un plan d'entraînement
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const resolvedParams = await params;
  const workoutId = resolvedParams.id;



  try {
    const db = await connectDB();
    const workoutRepository = new WorkoutRepository(db)
    const workoutService = new WorkoutService(workoutRepository)

    await workoutService.delete(userId, workoutId)

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidateTag("workouts");
    return NextResponse.json(ApiSuccess.DELETED("Plan d'entraînement"), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof NotFoundError) return NextResponse.json(ApiError.NOT_FOUND("Workout"), { status: 404 })
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PATCH - Modifier un plan d'entraînement
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const resolvedParams = await params;
  const workoutId = resolvedParams.id;

  // Validation des champs obligatoires
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

    const workout = await workoutService.update(userId, workoutId, { name, description, category, estimatedDuration, exercises })



    revalidatePath("/workouts");
    revalidatePath(`/workouts/${workoutId}`);
    revalidateTag("workouts");
    return NextResponse.json({ ...ApiSuccess.UPDATED("Plan d'entraînement"), workout }, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof DuplicateError) return NextResponse.json(ApiError.DUPLICATE("Nom de workout"), { status: 409 })
    if (error instanceof NotFoundError) return NextResponse.json(ApiError.NOT_FOUND("Workout"), { status: 404 })
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
