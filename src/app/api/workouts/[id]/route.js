import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
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
      return NextResponse.json(
        { error: "Plan d'entraînement non trouvé" },
        { status: 404 },
      );
    }

    revalidatePath("/workouts");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json(
      { success: true, message: "Plan d'entraînement supprimé avec succès" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entraînement" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const resolvedParams = await params;
  const workoutId = resolvedParams.id;

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

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId), "workouts._id": new ObjectId(workoutId) },
      {
        $set: {
          "workouts.$.name": name,
          "workouts.$.category": category,
          "workouts.$.estimationDuration": estimatedDuration,
          "workouts.$.description": description,
          "workouts.$.exercises": exercises,
          "workouts.$.updatedAt": new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Plan d'entraînement non trouvé" },
        { status: 404 },
      );
    }

    revalidatePath("/workouts");
    revalidatePath(`/workouts/${workoutId}`);
    return NextResponse.json(
      { success: true, message: "Entraînement modifié avec succès" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la modification de l'entraînement",
      },
      { status: 500 },
    );
  }
}
