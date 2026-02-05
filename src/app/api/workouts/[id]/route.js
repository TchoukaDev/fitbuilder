// API Route pour les opérations sur un plan d'entraînement spécifique (modification et suppression)
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import {
  workoutExercisesSchema,
  workoutSchema,
} from "@/Features/Workouts/utils/workoutSchema";

// DELETE - Supprimer un plan d'entraînement
export async function DELETE(req, { params }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const resolvedParams = await params;
  const workoutId = resolvedParams.id;

  const db = await connectDB();

  try {
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { workouts: { _id: new ObjectId(workoutId) } } },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(ApiError.NOT_FOUND("Plan d'entraînement"), {
        status: 404,
      });
    }

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidateTag("workouts");
    return NextResponse.json(ApiSuccess.DELETED("Plan d'entraînement"), {
      status: 200,
    });
  } catch (error) {
    console.error("Erreur suppression workout:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PATCH - Modifier un plan d'entraînement
export async function PATCH(req, { params }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const resolvedParams = await params;
  const workoutId = resolvedParams.id;

  // Validation des champs obligatoires
  const { name, description, category, estimatedDuration, exercises } =
    await req.json();

  // Validation des champs obligatoires
  const result = workoutSchema.safeParse({
    name,
    description,
    category,
    estimatedDuration,
  });

  let validationErrors = [];
  if (!result.success) {
    validationErrors.push(...result.error.issues.map((issue) => issue.message));
  }

  const resultExercises = workoutExercisesSchema.safeParse({
    exercises,
  });
  if (!resultExercises.success) {
    validationErrors.push(
      ...resultExercises.error.issues.map((issue) => issue.message),
    );
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      ApiError.INVALID_DATA(validationErrors.join(". ")),
      { status: 400 },
    );
  }

  const db = await connectDB();

  try {
    // Vérifier l'unicité du nom
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const nameExists = user?.workouts
      ?.filter((w) => w._id.toString() !== workoutId)
      .some((w) => w.name.toLowerCase() === name.toLowerCase());

    if (nameExists) {
      return NextResponse.json(ApiError.DUPLICATE("Un plan avec ce nom"), {
        status: 409,
      });
    }

    // Mise à jour du plan
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId), "workouts._id": new ObjectId(workoutId) },
      {
        $set: {
          "workouts.$.name": name,
          "workouts.$.category": category,
          "workouts.$.estimatedDuration": estimatedDuration,
          "workouts.$.description": description,
          "workouts.$.exercises": exercises,
          "workouts.$.updatedAt": new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(ApiError.NOT_FOUND("Plan d'entraînement"), {
        status: 404,
      });
    }

    revalidatePath("/workouts");
    revalidatePath(`/workouts/${workoutId}`);
    revalidateTag("workouts");
    return NextResponse.json(ApiSuccess.UPDATED("Plan d'entraînement"), {
      status: 200,
    });
  } catch (error) {
    console.error("Erreur modification workout:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
