import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { object, success } from "zod";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  //Vérification de session
  if (!userId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
  }
  const { name, description, category, estimatedDuration, exercises } =
    await req.json();

  // Vérification des champs
  if (
    !name.trim() ||
    !category.trim() ||
    !estimatedDuration ||
    exercises.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Le modèle d'entraînement doit comporter au moins un nom, une catégorie, une durée et un exercice",
      },
      { status: 400 },
    );
  }
  // Connexion MongoDB
  const db = await connectDB();
  try {
    //   Vérifier s'il existe déjà un workout avec ce nom
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const nameExists = user?.workouts?.some(
      (w) => w.name.toLowerCase() === name.toLowerCase(),
    );

    if (nameExists) {
      return NextResponse.json(
        { error: "Un plan avec ce nom existe déjà" },
        { status: 409 },
      );
    }

    const workoutId = new ObjectId();
    //Ajout du workout en db
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          workouts: {
            _id: workoutId,
            name,
            description,
            category,
            estimatedDuration,
            exercises,
            timesUsed: 0,
            lastUsedAt: null,
            createdAt: new Date(),
            updateAt: new Date(),
          },
        },
      },
      { upsert: true },
    );

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        success: true,
        workoutId: workoutId.toString(),
        message: "Plan d'entraînement créé avec succès",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la création de l'entraînement",
      },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
  }

  const db = await connectDB();

  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const workouts = user?.workouts;

    return NextResponse.json(workouts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la récupération des plans d'entraînement",
      },
      { status: 500 },
    );
  }
}
