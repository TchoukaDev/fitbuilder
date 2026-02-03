// API Route pour la gestion des exercices favoris (ajout, retrait, récupération)
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { getFavoritesExercises } from "@/Features/Exercises/utils";
import { UserDocument } from "@/types/user";

// PATCH - Ajouter ou retirer un exercice des favoris
export async function PATCH(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  try {
    const { exerciseId, action } = await req.json();

    // Validation des paramètres
    if (!exerciseId || !["add", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 },
      );
    }

    const db = await connectDB();

    if (action === "add") {
      await db
        .collection<UserDocument>("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $addToSet: { favoritesExercises: exerciseId } },
        );
    } else {
      await db
        .collection<UserDocument>("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $pull: { favoritesExercises: exerciseId } },
        );
    }

    revalidatePath("/dashboard");
    revalidatePath("/exercises");
    revalidatePath(`/exercices/${exerciseId}`);

    // Récupérer la liste mise à jour
    const user = await db
      .collection<UserDocument>("users")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { favoritesExercises: 1 } },
      );

    if (!user) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), { status: 404 });
    }

    return NextResponse.json(
      { favoritesExercises: user.favoritesExercises || [] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur PATCH favoritesExercises:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer la liste des favoris
export async function GET(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  try {
    // ✅ Utilise le helper
    const favoritesExercises = await getFavoritesExercises(userId);
    return NextResponse.json({ favoritesExercises }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET favoritesExercises:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
