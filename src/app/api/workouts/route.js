// API Route pour la gestion des plans d'entraînement (création et récupération)
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";

// POST - Créer un nouveau plan d'entraînement
export async function POST(req) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { name, description, category, estimatedDuration, exercises } =
    await req.json();

  // Validation des champs obligatoires
  if (
    !name.trim() ||
    !category.trim() ||
    !estimatedDuration ||
    exercises.length === 0
  ) {
    return NextResponse.json(
      ApiError.INVALID_DATA(
        "Le plan doit comporter un nom, une catégorie, une durée et au moins un exercice",
      ),
      { status: 400 },
    );
  }

  const db = await connectDB();

  try {
    // Vérifier l'unicité du nom
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const nameExists = user?.workouts?.some(
      (w) => w.name.toLowerCase() === name.toLowerCase(),
    );

    if (nameExists) {
      return NextResponse.json(ApiError.DUPLICATE("Un plan avec ce nom"), {
        status: 409,
      });
    }

    // Création du plan
    const workoutId = new ObjectId();
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
        ...ApiSuccess.CREATED("Plan d'entraînement"),
        workoutId: workoutId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur création workout:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer tous les plans d'entraînement de l'utilisateur
export async function GET(req) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const db = await connectDB();

  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const workouts = user?.workouts;

    return NextResponse.json(workouts, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération workouts:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
