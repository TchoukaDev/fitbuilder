// API Route pour les opérations sur une séance spécifique (récupération, modification, finalisation, suppression)
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";

// GET - Récupérer une séance spécifique
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  if (!userId) {
    return NextResponse.json(ApiError.UNAUTHORIZED, { status: 401 });
  }

  try {
    const db = await connectDB();
    const singleSession = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      "sessions._id": new ObjectId(sessionId),
    });
    if (!singleSession) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    }

    return NextResponse.json(singleSession, { status: 200 });
  } catch (error) {
    console.error("Erreur GET session:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PATCH - Mettre à jour les exercices et la durée d'une séance en cours
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  if (!userId) {
    return NextResponse.json(ApiError.UNAUTHORIZED, { status: 401 });
  }

  const { exercises, duration } = await req.json();

  if (!exercises || !Array.isArray(exercises)) {
    return NextResponse.json(
      ApiError.INVALID_DATA("Les exercices fournis ne sont pas valides"),
      { status: 400 },
    );
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
          "sessions.$.duration": duration,
          "sessions.$.updatedAt": new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    }

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json(
      ApiSuccess.OPERATION_SUCCESS("Sauvegarde de la progression"),
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur PATCH session:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PUT - Terminer une séance (changement de statut à "completed")
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(ApiError.UNAUTHORIZED, { status: 401 });
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const { exercises, duration } = await req.json();

  try {
    const db = await connectDB();

    // Vérifier que la séance existe
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      "sessions._id": new ObjectId(sessionId),
    });

    if (!user) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), {
        status: 404,
      });
    }

    const existingSession = user.sessions.find(
      (s) => s._id.toString() === sessionId,
    );

    if (!existingSession) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    }

    // Finaliser la séance
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
      return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
    }

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json(ApiSuccess.OPERATION_SUCCESS("Session terminée"), {
      status: 200,
    });
  } catch (error) {
    console.error("Erreur PUT session:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// DELETE - Supprimer une séance et mettre à jour les stats du plan d'entraînement
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(ApiError.UNAUTHORIZED, { status: 401 });
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  try {
    const db = await connectDB();

    // Récupérer la séance à supprimer
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      "sessions._id": new ObjectId(sessionId),
    });

    if (!user) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), {
        status: 404,
      });
    }

    const sessionToDelete = user.sessions.find(
      (s) => s._id.toString() === sessionId,
    );

    if (!sessionToDelete) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    }

    const templateId = sessionToDelete.templateId;

    // Supprimer la séance
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          sessions: { _id: new ObjectId(sessionId) },
        },
      },
    );

    // Mettre à jour les stats du plan d'entraînement
    const updatedUser = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    const otherSessions =
      updatedUser.sessions?.filter(
        (s) =>
          s.templateId.toString() === templateId.toString() &&
          s.status === "completed", // Seulement les séances terminées
      ) || [];

    // Calculer la nouvelle date de dernière utilisation
    let newLastUsedAt = null;
    if (otherSessions.length > 0) {
      otherSessions.sort(
        (a, b) =>
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime(),
      );
      newLastUsedAt = otherSessions[0].completedDate;
    }

    // Décrémenter le compteur et mettre à jour la date
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        "workouts._id": new ObjectId(templateId),
      },
      {
        $inc: { "workouts.$.timesUsed": -1 },
        $set: { "workouts.$.lastUsedAt": newLastUsedAt },
      },
    );

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json(ApiSuccess.DELETED("Session"), { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE session:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
