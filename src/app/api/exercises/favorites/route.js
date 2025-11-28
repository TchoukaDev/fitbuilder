// API Route pour la gestion des exercices favoris (ajout, retrait, récupération)
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";

// PATCH - Ajouter ou retirer un exercice des favoris
export async function PATCH(req) {
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
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $addToSet: { favoritesExercises: exerciseId } },
        );
    } else {
      await db
        .collection("users")
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
      .collection("users")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { favoritesExercises: 1 } },
      );

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
export async function GET(req) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  try {
    const db = await connectDB();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    const favoritesExercises = user.favoritesExercises || [];

    return NextResponse.json({ favoritesExercises }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET favoritesExercises:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
