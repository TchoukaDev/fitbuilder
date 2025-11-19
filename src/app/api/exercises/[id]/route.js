import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// ========================================
// PATCH - Modifier un exercice
// ========================================
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const { name, muscle, equipment, description } = await request.json();

  if (!name || !muscle || !equipment) {
    return NextResponse.json(
      {
        error: "L'intitulé', le groupe musculaire et l'équipement sont requis",
      },
      { status: 400 },
    );
  }

  try {
    const db = await connectDB();

    // Vérifier si c'est un exercice public
    const publicExercise = await db
      .collection("exercises")
      .findOne({ _id: new ObjectId(id) });

    if (publicExercise) {
      // C'est un exercice public → Admin seulement
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Seul l'admin peut modifier les exercices publics" },
          { status: 403 },
        );
      }

      await db
        .collection("exercises")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { name, muscle, equipment, description } },
        );

      revalidatePath("/exercices");
      revalidatePath(`/exercises/${id}`);

      return NextResponse.json({
        success: true,
        message: "L'exercice a été modifié",
      });
    }

    // Sinon, c'est un exercice privé → Modifier dans le tableau user
    const result = await db.collection("users").updateOne(
      {
        _id: new ObjectId(session.user.id),
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

    return NextResponse.json({
      success: true,
      message: "L'exercice a été modifié.",
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ========================================
// DELETE - Supprimer un exercice
// ========================================
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const db = await connectDB();

    // Vérifier si c'est un exercice public
    const publicExercise = await db
      .collection("exercises")
      .findOne({ _id: new ObjectId(id) });

    if (publicExercise) {
      // C'est un exercice public → Admin seulement
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Seul l'admin peut supprimer les exercices publics" },
          { status: 403 },
        );
      }

      await db.collection("exercises").deleteOne({ _id: new ObjectId(id) });

      revalidatePath("/exercices");
      revalidatePath("/dashboard");
      revalidatePath("/workouts/create");

      return NextResponse.json({
        success: true,
        message: "Exercice public supprimé",
      });
    }

    // Sinon, exercice privé → Retirer du tableau
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $pull: { exercises: { _id: new ObjectId(id) } } },
      );

    //   Si matchedCount (=nombre d'exercice trouvé dans updateOne) = 0
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

    return NextResponse.json(
      {
        success: true,
        message: "Exercice privé supprimé",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
