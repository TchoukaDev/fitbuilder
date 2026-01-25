// API Route pour les opérations sur un exercice spécifique (modification et suppression)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { exerciseSchema } from "@/Features/Exercises/utils/ExerciseSchema";
import { ExerciseDB } from "@/types/exercise";
import { UserDocument } from "@/types/user";

// PATCH - Modifier un exercice (public si admin, privé si utilisateur)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const { name, muscle, equipment, description } = await request.json();

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

  try {
    const db = await connectDB();

    // Vérifier si c'est un exercice public
    const publicExercise = await db
      .collection<ExerciseDB>("exercises")
      .findOne({ _id: new ObjectId(id) });

    if (publicExercise) {
      // C'est un exercice public → Admin seulement
      if (userRole !== "ADMIN") {
        return NextResponse.json(
          { error: "Seul l'admin peut modifier les exercices publics" },
          { status: 403 },
        );
      }

      await db
        .collection<ExerciseDB>("exercises")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { name, muscle, equipment, description } },
        );

      revalidatePath("/exercices");
      revalidatePath(`/exercises/${id}`);

      return NextResponse.json(ApiSuccess.UPDATED("Exercice public"));
    }

    // Exercice privé: modifier dans le tableau de l'utilisateur
    const result = await db.collection<UserDocument>("users").updateOne(
      {
        _id: new ObjectId(userId),
        "exercises._id": new ObjectId(id),
      },
      {
        $set: {
          "exercises.$.name": name,
          "exercises.$.muscle": muscle,
          "exercises.$.equipment": equipment,
          "exercises.$.description": description,
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Exercice non trouvé ou non autorisé" },
        { status: 404 },
      );
    }

    revalidatePath("/exercices");
    revalidatePath(`/exercises/${id}`);

    return NextResponse.json(ApiSuccess.UPDATED("Exercice privé"));
  } catch (error) {
    console.error("Erreur modification exercice:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// DELETE - Supprimer un exercice (public si admin, privé si utilisateur)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { userId, userRole } = auth;

  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const db = await connectDB();

    // Vérifier si c'est un exercice public
    const publicExercise = await db
      .collection<ExerciseDB>("exercises")
      .findOne({ _id: new ObjectId(id) });

    if (publicExercise) {
      // C'est un exercice public → Admin seulement
      if (userRole !== "ADMIN") {
        return NextResponse.json(
          { error: "Seul l'admin peut supprimer les exercices publics" },
          { status: 403 },
        );
      }

      await db.collection<ExerciseDB>("exercises").deleteOne({ _id: new ObjectId(id) });

      revalidatePath("/exercices");
      revalidatePath("/dashboard");
      revalidatePath("/workouts/create");

      return NextResponse.json(ApiSuccess.DELETED("Exercice public"));
    }

    // Exercice privé: retirer du tableau de l'utilisateur
    const result = await db
      .collection<UserDocument>("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { exercises: { _id: new ObjectId(id) } } },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Exercice non trouvé" },
        { status: 404 },
      );
    }
    revalidatePath("/exercices");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/workouts/create");

    return NextResponse.json(ApiSuccess.DELETED("Exercice privé"), {
      status: 200,
    });
  } catch (error) {
    console.error("Erreur suppression exercice:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
