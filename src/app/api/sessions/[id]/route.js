import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// GET
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const db = await connectDB();
    const singleSession = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      "sessions._id": new ObjectId(sessionId),
    });
    if (!singleSession) {
      return NextResponse.json(
        { error: "Cette session n'existe pas" },
        { status: 404 },
      );
    }
    return NextResponse.json(singleSession, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Une erreur est intervenue lors de la récupération de la session",
      },
      { status: 500 },
    );
  }
}

// PATCH
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const { exercises } = await req.json();
  console.log(exercises);
  if (!exercises || !Array.isArray(exercises)) {
    return NextResponse.json({ error: "Exercices invalides" }, { status: 400 });
  }
  try {
    const db = await connectDB();
    const result = await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        "sessions._id": new ObjectId(sessionId),
      },
      {
        $set: {
          "sessions.$.exercises": exercises,
          "sessions.$.updatedAt": new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Cette session n'existe pas" },
        { status: 404 },
      );
    }
    revalidatePath(`/sessions/${sessionId}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Une erreur est intervenue lors de la modification",
      },
      { status: 500 },
    );
  }
}

// PUT (fin de séance)
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const { exercises, duration } = await req.json();

  try {
    const db = await connectDB();

    // Récupérer la session pour calculer la durée
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      "sessions._id": new ObjectId(sessionId),
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur" }, { status: 404 });
    }

    const existingSession = user.sessions.find(
      (s) => s._id.toString() === sessionId,
    );

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 },
      );
    }

    // Mettre à jour la session
    const result = await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        "sessions._id": new ObjectId(sessionId),
      },
      {
        $set: {
          "sessions.$.exercises": exercises,
          "sessions.$.status": "completed",
          "sessions.$.completedDate": new Date(),
          "sessions.$.duration": duration,
          "sessions.$.updatedAt": new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Échec de la mise à jour" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Séance terminée avec succès",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur PUT session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la finalisation" },
      { status: 500 },
    );
  }
}

// DELETE
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  try {
    const db = await connectDB();

    // ═══════════════════════════════════════════════════════
    // 1. RÉCUPÉRER LA SESSION À SUPPRIMER
    // ═══════════════════════════════════════════════════════
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      "sessions._id": new ObjectId(sessionId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 },
      );
    }

    const sessionToDelete = user.sessions.find(
      (s) => s._id.toString() === sessionId,
    );

    if (!sessionToDelete) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 },
      );
    }

    const templateId = sessionToDelete.templateId;

    // ═══════════════════════════════════════════════════════
    // 2. SUPPRIMER LA SESSION
    // ═══════════════════════════════════════════════════════
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          sessions: { _id: new ObjectId(sessionId) },
        },
      },
    );

    // ═══════════════════════════════════════════════════════
    // 3. DÉCRÉMENTER timesUsed DU WORKOUT
    // ═══════════════════════════════════════════════════════
    // Chercher les autres sessions de ce workout (pour lastUsedAt)
    const updatedUser = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    const otherSessions =
      updatedUser.sessions?.filter(
        (s) =>
          s.templateId.toString() === templateId.toString() &&
          s.status === "completed", // Seulement les séances terminées
      ) || [];

    // Trouver la date de la dernière session restante
    let newLastUsedAt = null;
    if (otherSessions.length > 0) {
      // Trier par date décroissante et prendre la première
      otherSessions.sort(
        (a, b) =>
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime(),
      );
      newLastUsedAt = otherSessions[0].completedDate;
    }

    // Mettre à jour le workout
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        "workouts._id": new ObjectId(templateId),
      },
      {
        $inc: { "workouts.$.timesUsed": -1 }, // ✅ Décrémenter
        $set: { "workouts.$.lastUsedAt": newLastUsedAt }, // ✅ Restaurer ou null
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Séance annulée avec succès",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur DELETE session:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 },
    );
  }
}
