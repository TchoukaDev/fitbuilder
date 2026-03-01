// API Route pour la gestion des exercices favoris (ajout, retrait, récupération)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { ExerciseRepository } from "@/repositories/ExerciseRepository";
import { ExerciseService } from "@/services/ExerciseService";
import { NotFoundError } from "@/libs/ServicesErrors";

// PATCH - Ajouter ou retirer un exercice des favoris
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { exerciseId, action } = await req.json();

  if (!exerciseId || !["add", "remove"].includes(action)) {
    return NextResponse.json(
      ApiError.INVALID_DATA("Paramètres invalides : exerciseId et action (add | remove) requis"),
      { status: 400 },
    );
  }

  try {
    const db = await connectDB();
    const service = new ExerciseService(new ExerciseRepository(db));

    const favoritesExercises = await service.toggleFavorite(userId, exerciseId, action);

    revalidatePath("/exercises");
    revalidatePath("/dashboard");
    revalidateTag("favorites");

    return NextResponse.json({ favoritesExercises }, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) return NextResponse.json(ApiError.NOT_FOUND("Exercice"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer la liste des favoris
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  try {
    const db = await connectDB();
    const service = new ExerciseService(new ExerciseRepository(db));
    const favoritesExercises = await service.getFavorites(userId);
    return NextResponse.json({ favoritesExercises }, { status: 200 });
  } catch {
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
