import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// POST - Créer un exercice

export async function POST(req) {
  const session = await getServerSession(authOptions);

  // Si non connecté, erreur
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  // Admin ou pas?
  const isAdmin = session?.user?.role === "ADMIN";

  // On récupère les variables du formulaire
  const { name, muscle, equipment, description } = await req.json();

  // Si champ manquant
  if (!name || !muscle || !equipment) {
    return NextResponse.json(
      {
        error: "L'intitulé', le groupe musculaire et l'équipement sont requis",
      },
      { status: 400 },
    );
  }
  // Connexion MongoDb
  const db = await connectDB();

  try {
    // Si Admin : exercices publics
    if (isAdmin) {
      const result = await db.collection("exercises").insertOne({
        name,
        muscle,
        equipment,
        description,
        isPublic: true,
        createdAt: new Date(),
      });

      revalidatePath("/exercises");
      revalidatePath("/admin");

      return NextResponse.json(
        {
          success: true,
          id: result.insertedId,
          message: "Exercice public créé",
        },
        { status: 201 },
      );
    }

    // Si utilisateur normal : exercices perso
    //   On créé un id pour l'exercice
    const exerciseId = new ObjectId();

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $push: {
          exercises: {
            _id: exerciseId,
            name,
            muscle,
            equipment,
            description,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true }, // Crée le user si n'existe pas
    );

    revalidatePath("/exercises");
    revalidatePath("/dashboard");

    // Succès
    return NextResponse.json(
      {
        success: true,
        id: exerciseId.toString(),
        message: "Exercice personnel créé",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET - Récupérer les exercices

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  // Récupérer le paramètre (?type=...)
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    const db = await connectDB();

    // Exercices privés

    if (type === "private") {
      // Récupérer user et ses exercices perso
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(session.user.id) });

      const privateExercises = user?.exercises || [];

      // On ajoute le titre privé
      const privateExercisesWithType = privateExercises.map((exercise) => ({
        ...exercise,
        type: "private",
      }));

      return NextResponse.json({ privateExercisesWithType }, { status: 200 });
    }

    //Exercices publics

    if (type === "public") {
      //  Récupérer exercices publics
      const publicExercises = await db
        .collection("exercises")
        .find({ isPublic: true })
        .toArray();

      const publicExercisesWithType = publicExercises.map((exercise) => ({
        ...exercise,
        type: "public",
      }));

      return NextResponse.json({ publicExercises }, { status: 200 });
    }

    // ============ TOUS (par défaut) ============

    // public
    const publicExercises = await db
      .collection("exercises")
      .find({ isPublic: true })
      .toArray();

    // privés
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    const privateExercises = user?.exercises || [];

    // Fusionner les deux tableaux et ajouter le type
    const allExercises = [
      ...publicExercises.map((ex) => ({ ...ex, type: "public" })),
      ...privateExercises.map((ex) => ({ ...ex, type: "private" })),
    ];

    return NextResponse.json(allExercises, { status: 200 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}
