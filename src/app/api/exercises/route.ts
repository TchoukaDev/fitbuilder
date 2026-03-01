// API Route pour la gestion des exercices (création et récupération)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { exerciseSchema, ExerciseFormData } from "@/Features/Exercises/utils/ExerciseSchema";
import { getPublicExercises, getPrivateExercises, getAllExercises } from "@/Features/Exercises/utils";
import { ExerciseRepository } from "@/repositories/ExerciseRepository";
import { ExerciseService } from "@/services/ExerciseService";
import { DuplicateError, ForbiddenError } from "@/libs/ServicesErrors";

// POST - Créer un exercice (public si admin, privé sinon)
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;
  const isAdmin = userRole === "ADMIN";

  const body: ExerciseFormData = await req.json();
  const result = exerciseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      ApiError.MISSING_FIELDS(["nom", "muscle", "matériel nécessaire"]),
      { status: 400 },
    );
  }

  const { name, muscle, equipment, description } = result.data;

  try {
    const db = await connectDB();
    const service = new ExerciseService(new ExerciseRepository(db));

    const exercise = await service.create(userId, isAdmin, {
      name,
      muscle,
      equipment,
      description: description ?? null,
    });

    revalidatePath("/exercises");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidateTag("exercises");
    revalidateTag("favorites");

    return NextResponse.json(
      {
        ...ApiSuccess.CREATED(isAdmin ? "Exercice public" : "Exercice personnel"),
        id: exercise.exerciseId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DuplicateError) return NextResponse.json(ApiError.DUPLICATE("Cet exercice public"), { status: 409 });
    if (error instanceof ForbiddenError) return NextResponse.json(ApiError.FORBIDDEN, { status: 403 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer les exercices (public, privé ou tous selon le paramètre ?type=)
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    if (type === "private") {
      const exercises = await getPrivateExercises(userId);
      return NextResponse.json(exercises, { status: 200 });
    }

    if (type === "public") {
      const exercises = await getPublicExercises();
      return NextResponse.json(exercises, { status: 200 });
    }

    const exercises = await getAllExercises(userId);
    return NextResponse.json(exercises, { status: 200 });
  } catch {
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
