// API Route pour les opérations sur une séance spécifique (récupération, modification, finalisation, suppression)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { getSessionbyId } from "@/Features/Sessions/utils";
import { CompletedSessionType, WorkoutSession, WorkoutSessionDB } from "@/types/workoutSession";
import { SessionExercise } from "@/types/SessionExercise";
import { WorkoutDB } from "@/types/workout";
import { UserDocument } from "@/types/user";

// GET - Récupérer une séance spécifique
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  try {
    // ✅ Utilise le helper qui retourne WorkoutSession avec id (pas _id)
    const session = await getSessionbyId(userId, sessionId);

    if (!session) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Erreur GET session:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PATCH - Mettre à jour les exercices et la durée d'une séance en cours
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;
  const { action, exercises, duration, updatedSession } = await req.json();
  const db = await connectDB();

  try {
    // 1. Récupérer la session
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { sessions: true, workouts: true } },
      );

    if (!user) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), {
        status: 404,
      });
    }

    const session = user?.sessions?.find((s: WorkoutSessionDB) => s._id.toString() === sessionId);
    if (!session) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), {
        status: 404,
      });
    }

    switch (action) {
      // CAS 1: Démarrer une session planifiée
      case "start":
        // 2. Démarrer + incrémenter timesUsed


        const resetedExercises = session.exercises.map((exercise: SessionExercise) => {
          return {
            ...exercise,
            actualSets: Array.from({ length: exercise.targetSets }).map(() => ({
              reps: null,
              weight: exercise.targetWeight,
              completed: false,
            })),
          };
        });


        const startResult = await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              "sessions.$[session].startedAt": new Date(),
              "sessions.$[session].exercises": resetedExercises,
              "sessions.$[session].status": "in-progress",
              "sessions.$[session].updatedAt": new Date(),
              "workouts.$[workout].lastUsedAt": new Date(),
            },
            $inc: {
              "workouts.$[workout].timesUsed": 1,
            },
          },
          {
            arrayFilters: [
              { "session._id": new ObjectId(sessionId) },
              { "workout._id": new ObjectId(session.workoutId) },
            ],
          },
        );

        if (startResult.matchedCount === 0) {
          return NextResponse.json(ApiError.NOT_FOUND("Session"), {
            status: 404,
          });
        }

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/calendar");

        return NextResponse.json(
          ApiSuccess.OPERATION_SUCCESS("Séance démarrée"),
          { status: 200 },
        );

      // CAS 2: Sauvegarder la progression d'une session en cours
      case "save":
        if (!exercises || !Array.isArray(exercises)) {
          return NextResponse.json(
            ApiError.INVALID_DATA("Les exercices fournis ne sont pas valides"),
            { status: 400 },
          );
        }

        const saveResult = await db.collection("users").updateOne(
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

        if (saveResult.matchedCount === 0) {
          return NextResponse.json(ApiError.NOT_FOUND("Session"), {
            status: 404,
          });
        }

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/dashboard");
        revalidatePath("/admin");

        return NextResponse.json(
          ApiSuccess.OPERATION_SUCCESS("Sauvegarde de la progression"),
          { status: 200 },
        );

      // CAS 3: Annuler une session planifiée
      case "cancel":
        // Vérifier que la session est en cours
        if (session.status !== "in-progress") {
          return NextResponse.json(
            ApiError.INVALID_DATA(
              "Seules les sessions en cours peuvent être annulées",
            ),
            { status: 400 },
          );
        }

        const workoutId = session.workoutId;
        const otherSessions: CompletedSessionType[] =
          user.sessions?.filter(
            (s: WorkoutSession) =>
              s.workoutId.toString() === workoutId.toString() &&
              s.status === "completed", // Seulement les séances terminées
          ) || [];

        // Calculer la nouvelle date de dernière utilisation
        let newLastUsedAt: Date | null = null;
        if (otherSessions.length > 0) {
          otherSessions.sort(
            (a, b) =>
              new Date(b.completedDate).getTime() -
              new Date(a.completedDate).getTime(),
          );
          newLastUsedAt = new Date(otherSessions[0].completedDate);
        }

        // Décrémenter le compteur et mettre à jour la date
        let timesUsed =
          user.workouts?.find((w: WorkoutDB) => w._id.toString() === workoutId.toString())
            ?.timesUsed ?? 0;
        if (timesUsed > 0) {
          timesUsed--;
        }

        const cancelResult = await db.collection("users").updateOne(
          {
            _id: new ObjectId(userId),
          },
          {
            $set: {
              "workouts.$[workout].lastUsedAt": newLastUsedAt,
              "workouts.$[workout].timesUsed": timesUsed,
              "sessions.$[session].startedAt": null,
              "sessions.$[session].completedDate": null,
              "sessions.$[session].duration": null,
              "sessions.$[session].updatedAt": new Date(),
              "sessions.$[session].exercises.$[].actualSets": [],
              "sessions.$[session].exercises.$[].completed": false,
              "sessions.$[session].exercises.$[].effort": null,
              "sessions.$[session].exercises.$[].notes": "",
              "sessions.$[session].status": "planned",
            },
          },
          {
            arrayFilters: [
              { "workout._id": new ObjectId(workoutId) },
              { "session._id": new ObjectId(sessionId) },
            ],
          },
        );

        if (cancelResult.matchedCount === 0) {
          return NextResponse.json(ApiError.NOT_FOUND("Session"), {
            status: 404,
          });
        }

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/calendar");

        return NextResponse.json(
          ApiSuccess.OPERATION_SUCCESS("Séance annulée"),
          { status: 200 },
        );

      // CAS 4: Mettre à jour une session planifiée
      case "update":
        if (!updatedSession) {
          return NextResponse.json(
            ApiError.INVALID_DATA("Session non trouvée"),
            {
              status: 404,
            },
          );
        }
        const updateResult = await db.collection("users").updateOne(
          {
            _id: new ObjectId(userId),
            "sessions._id": new ObjectId(sessionId),
          },
          {
            $set: {
              "sessions.$.workoutId": updatedSession.workoutId,
              "sessions.$.workoutName": updatedSession.workoutName,
              "sessions.$.exercises": updatedSession.exercises,
              "sessions.$.scheduledDate": updatedSession.scheduledDate,
              "sessions.$.estimatedDuration": updatedSession.estimatedDuration,
              "sessions.$.updatedAt": new Date(),
            },
          },
        );
        if (updateResult.matchedCount === 0) {
          return NextResponse.json(ApiError.NOT_FOUND("Session"), {
            status: 404,
          });
        }
        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/calendar");
        return NextResponse.json(
          ApiSuccess.OPERATION_SUCCESS("Session mise à jour"),
          { status: 200 },
        );
    }
  } catch (error) {
    console.error("Erreur PATCH session:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PUT - Terminer une séance (changement de statut à "completed")
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

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
      (s: WorkoutSessionDB) => s._id.toString() === sessionId,
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Vérification de l'authentification
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

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
      (s: WorkoutSessionDB) => s._id.toString() === sessionId,
    );

    if (!sessionToDelete) {
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    }

    const workoutId = sessionToDelete.workoutId;

    // Supprimer la séance
    await db.collection<UserDocument>("users").updateOne(
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

    if (!updatedUser) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), {
        status: 404,
      });
    }

    const otherSessions: CompletedSessionType[] =
      updatedUser.sessions?.filter(
        (s: WorkoutSession) =>
          s.workoutId.toString() === workoutId.toString() &&
          s.status === "completed", // Seulement les séances terminées
      ) || [];

    // Calculer la nouvelle date de dernière utilisation
    let newLastUsedAt: Date | null = null
    if (otherSessions.length > 0) {
      otherSessions.sort(
        (a, b) =>
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime(),
      );
      newLastUsedAt = new Date(otherSessions[0].completedDate);
    }

    // Décrémenter le compteur et mettre à jour la date
    let timesUsed =
      updatedUser.workouts?.find(
        (w: WorkoutDB) => w._id.toString() === workoutId.toString(),
      )?.timesUsed ?? 0;
    if (timesUsed > 0) {
      timesUsed--;
    }

    await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        "workouts._id": new ObjectId(workoutId),
      },
      {
        $set: {
          "workouts.$.timesUsed": timesUsed,
          "workouts.$.lastUsedAt": newLastUsedAt,
        },
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
