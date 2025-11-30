// API Route pour la gestion des exercices (création et récupération)
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { exerciseSchema } from "@/Features/Exercises/utils/ExerciseSchema";

// POST - Créer un exercice (public si admin, privé sinon)
export async function POST(req) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;
  const isAdmin = userRole === "ADMIN";
  const { name, muscle, equipment, description } = await req.json();

  // Validation des champs obligatoires
  const result = exerciseSchema.safeParse({
    name,
    muscle,
    equipment,
    description,
  });
  if (!result.success) {
    return NextResponse.json(
      ApiError.MISSING_FIELDS(["nom", "muscle", "matériel nécessaire"]),
      { status: 400 },
    );
  }

  const db = await connectDB();

  try {
    // Création d'exercice public (admin uniquement)
    if (isAdmin) {
      // Vérifier si l'exercice existe déjà en public
      const exerciseExists = await db.collection("exercises").findOne({ name });
      if (exerciseExists) {
        return NextResponse.json(ApiError.DUPLICATE("Cet exercice public"), {
          status: 409,
        });
      }

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
          ...ApiSuccess.CREATED("Exercice public"),
          id: result.insertedId,
        },
        { status: 201 },
      );
    }

    // Création d'exercice privé (utilisateur normal)

    // Vérifier si l'exercice existe déjà pour l'utilisateur
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    const exerciseExists = user?.exercises?.some((ex) => ex.name === name);
    if (exerciseExists) {
      return NextResponse.json(ApiError.DUPLICATE("Cet exercice"), {
        status: 409,
      });
    }

    const exerciseId = new ObjectId();
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
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
      { upsert: true },
    );

    revalidatePath("/exercises");
    revalidatePath("/dashboard");

    return NextResponse.json(
      {
        ...ApiSuccess.CREATED("Exercice personnel"),
        id: exerciseId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur création exercice:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer les exercices (public, privé ou tous selon le paramètre type)
export async function GET(req) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    const db = await connectDB();

    // Cas 1: Exercices privés uniquement
    if (type === "private") {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });

      const privateExercises = user?.exercises || [];

      const privateExercisesWithType = privateExercises.map((exercise) => ({
        ...exercise,
        type: "private",
      }));

      return NextResponse.json({ privateExercisesWithType }, { status: 200 });
    }

    // Cas 2: Exercices publics uniquement
    if (type === "public") {
      const publicExercises = await db
        .collection("exercises")
        .find({ isPublic: true })
        .toArray();

      const publicExercisesWithType = publicExercises.map((exercise) => ({
        ...exercise,
        type: "public",
      }));

      return NextResponse.json(
        { publicExercises: publicExercisesWithType },
        { status: 200 },
      );
    }

    // Cas 3: Tous les exercices (par défaut)
    const publicExercises = await db
      .collection("exercises")
      .find({ isPublic: true })
      .toArray();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const privateExercises = user?.exercises || [];

    // Fusionner les deux tableaux et ajouter le type
    const allExercises = [
      ...publicExercises.map((ex) => ({ ...ex, type: "public" })),
      ...privateExercises.map((ex) => ({ ...ex, type: "private" })),
    ];

    return NextResponse.json(allExercises, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération exercices:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
