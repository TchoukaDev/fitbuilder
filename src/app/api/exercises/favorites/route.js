import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// POST - Sauvegarder la liste complète des favoris
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { favorites } = await req.json(); // Tableau complet d'IDs

    const db = await connectDB();

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { favoritesExercises: favorites } }, // Remplace tout le tableau
      { upsert: true },
    );

    revalidatePath("/exercises");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur POST favorites:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des favoris" },
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
