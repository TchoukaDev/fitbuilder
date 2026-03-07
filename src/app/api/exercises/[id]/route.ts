// API Route pour les opérations sur un exercice spécifique (modification et suppression)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { exerciseSchema } from "@/Features/Exercises/utils/ExerciseSchema";
import { ExerciseRepository } from "@/repositories/ExerciseRepository";
import { ExerciseService } from "@/services/ExerciseService";
import { DuplicateError, ForbiddenError, NotFoundError } from "@/libs/ServicesErrors";

// PATCH - Modifier un exercice (public si admin, privé si utilisateur)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;
  const isAdmin = userRole === "ADMIN";
  const { id: exerciseId } = await params;

  const body = await req.json();
  const result = exerciseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      ApiError.MISSING_FIELDS(["nom", "muscle", "matériel nécessaire"]),
      { status: 400 },
    );
  }

  const { name, primary_muscle, secondary_muscles, equipment, description } = result.data;

  try {
    const db = await connectDB();
    const service = new ExerciseService(new ExerciseRepository(db));

    const exercise = await service.update(userId, exerciseId, isAdmin, {
      name,
      primary_muscle,
      secondary_muscles,
      equipment,
      description: description ?? null,
    });

    revalidatePath("/exercises");
    revalidatePath(`/exercises/${exerciseId}`);
    revalidatePath("/admin");
    revalidateTag("exercises");

    return NextResponse.json(
      { ...ApiSuccess.UPDATED("Exercice"), exercise },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ForbiddenError) return NextResponse.json(ApiError.FORBIDDEN, { status: 403 });
    if (error instanceof NotFoundError) return NextResponse.json(ApiError.NOT_FOUND("Exercice"), { status: 404 });
    if (error instanceof DuplicateError) return NextResponse.json(ApiError.DUPLICATE("Ce nom d'exercice"), { status: 409 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// DELETE - Supprimer un exercice (public si admin, privé si utilisateur)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;
  const isAdmin = userRole === "ADMIN";
  const { id: exerciseId } = await params;

  try {
    const db = await connectDB();
    const service = new ExerciseService(new ExerciseRepository(db));

    await service.delete(userId, exerciseId, isAdmin);

    revalidatePath("/exercises");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/workouts/create");
    revalidateTag("exercises");

    return NextResponse.json(ApiSuccess.DELETED("Exercice"), { status: 200 });
  } catch (error) {
    if (error instanceof ForbiddenError) return NextResponse.json(ApiError.FORBIDDEN, { status: 403 });
    if (error instanceof NotFoundError) return NextResponse.json(ApiError.NOT_FOUND("Exercice"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
