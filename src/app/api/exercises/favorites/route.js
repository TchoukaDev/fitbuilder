import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// PATCH - Ajouter ou retirer un seul favori
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { exerciseId, action } = await req.json(); // action: "add" ou "remove"

    if (!exerciseId || !["add", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 },
      );
    }

    const db = await connectDB();

    if (action === "add") {
      // Ajoute si pas déjà présent
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $addToSet: { favoritesExercises: exerciseId } },
        );
    } else {
      // Retire
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

    // Récupère la nouvelle liste
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { favoritesExercises: 1 } },
      );

    return NextResponse.json(
      {
        success: true,
        favorites: user.favoritesExercises || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur PATCH favorites:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 },
    );
  }
}

// GET - Récupérer la liste des favoris
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

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

    const favorites = user.favoritesExercises || [];

    return NextResponse.json({ favorites }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET favorites:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des favoris" },
      { status: 500 },
    );
  }
}
