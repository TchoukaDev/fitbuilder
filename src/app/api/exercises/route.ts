// API Route pour la gestion des exercices (création et récupération)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { exerciseSchema, ExerciseFormData } from "@/Features/Exercises/utils/ExerciseSchema";
import { getPublicExercises, getPrivateExercises, getAllExercises } from "@/Features/Exercises/utils";
import { UserDocument } from "@/types/user";
import { ExerciseDB } from "@/types/exercise";

// POST - Créer un exercice (public si admin, privé sinon)
export async function POST(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;
  const isAdmin = userRole === "ADMIN";
  const body: ExerciseFormData = await req.json();

  // Validation des champs obligatoires
  const result = exerciseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      ApiError.MISSING_FIELDS(["nom", "muscle", "matériel nécessaire"]),
      { status: 400 },
    );
  }

  const { name, muscle, equipment, description } = result.data;

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

      const insertResult = await db.collection("exercises").insertOne({
        name,
        muscle,
        equipment,
        description,
        isPublic: true,
        createdAt: new Date(),
      });

      revalidatePath("/exercises");
      revalidatePath("/admin");
      revalidateTag("exercises");
      revalidateTag("favorites");
      return NextResponse.json(
        {
          ...ApiSuccess.CREATED("Exercice public"),
          id: insertResult.insertedId,
        },
        { status: 201 },
      );
    }

    // Création d'exercice privé (utilisateur normal)

    // Vérifier si l'exercice existe déjà pour l'utilisateur
    const user = await db
      .collection<UserDocument>("users")
      .findOne({ _id: new ObjectId(userId) });
    const exerciseExists = user?.exercises?.some((ex: ExerciseDB) => ex.name === name);
    if (exerciseExists) {
      return NextResponse.json(ApiError.DUPLICATE("Cet exercice"), {
        status: 409,
      });
    }

    const exerciseId = new ObjectId();
    const newExercise: ExerciseDB = {
      _id: exerciseId,
      name,
      muscle,
      equipment,
      description: description ?? null,
      isPublic: false,
      createdAt: new Date(),
    };

    await db.collection<UserDocument>("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          exercises: newExercise,
        },
      },
      { upsert: true },
    );

    revalidatePath("/exercises");
    revalidatePath("/dashboard");
    revalidateTag("exercises");
    revalidateTag("favorites");

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
export async function GET(req: NextRequest) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    // ✅ Cas 1: Exercices privés uniquement
    if (type === "private") {
      const exercises = await getPrivateExercises(userId);
      return NextResponse.json(exercises, { status: 200 });
    }

    // ✅ Cas 2: Exercices publics uniquement
    if (type === "public") {
      const exercises = await getPublicExercises();
      return NextResponse.json(exercises, { status: 200 });
    }

    // ✅ Cas 3: Tous les exercices (par défaut)
    const exercises = await getAllExercises(userId);
    return NextResponse.json(exercises, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération exercices:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
