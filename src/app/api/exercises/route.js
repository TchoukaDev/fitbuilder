import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  // Si non connecté, erreur
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

  // On récupère les variables du formulaire
  const { name, muscle, equipment, description } = await req.json();

  if (!name || !muscle || !equipment) {
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
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

    return NextResponse.json(
      {
        success: true,
        id: exerciseId,
        message: "Exercice personnel créé",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Ajoute le !
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const db = await connectDB();

    // 1. Récupérer exercices publics
    const publicExercises = await db
      .collection("exercises")
      .find({ isPublic: true })
      .toArray();

    // 2. Récupérer user et ses exercices perso
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    const privateExercises = user?.exercises || [];

    // 3. Combiner les deux tableaux
    const allExercises = [...publicExercises, ...privateExercises];

    return NextResponse.json(allExercises, { status: 200 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}
