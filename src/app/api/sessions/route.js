import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
  }

  const { templateId, templateName, exercises } = await req.json();

  // Validation
  if (!templateId || !templateName || exercises.length === 0) {
    return NextResponse.json(
      { error: "Un entraînement est nécessaire pour démarrer la session" },
      { status: 400 },
    );
  }

  const db = await connectDB();

  try {
    // Préparer les exercices pour la session (avec champs actualSets vides)
    const sessionExercises = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.name,
      order: ex.order,
      targetSets: ex.sets,
      targetReps: ex.reps,
      targetWeight: ex.targetWeight || null,
      restTime: ex.restTime || 90,
      actualSets: [], // Sera rempli pendant l'exécution
      notes: "",
      effort: null,
      completed: false,
    }));

    // Créer la session
    const sessionId = new ObjectId();

    const newSession = {
      _id: sessionId,
      userId: new ObjectId(userId),
      templateId: new ObjectId(templateId),
      templateName: templateName,
      scheduledDate: new Date(), // Date du jour
      status: "in-progress",
      startedAt: new Date(),
      completedDate: null,
      duration: 0,
      exercises: sessionExercises,
      overallNotes: "",
      overallFeeling: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Incrémenter timesUsed du template
    await db.collection("users").updateOne(
      // ═══════════════════════════════════════════════════════
      // 🎯 FILTRE : Quel document modifier ?
      // ═══════════════════════════════════════════════════════
      { _id: new ObjectId(userId) },
      // ↑ On cherche l'utilisateur par son ID

      // ═══════════════════════════════════════════════════════
      // 🔧 OPÉRATIONS : Que modifier ?
      // ═══════════════════════════════════════════════════════
      {
        // ─────────────────────────────────────────────────────
        // 📈 $inc : INCrémenter une valeur numérique
        // ─────────────────────────────────────────────────────
        $inc: {
          "workouts.$[workout].timesUsed": 1,
          // ↑ "workouts" = le tableau
          // ↑ "$[workout]" = placeholder pour "l'élément qui match la condition"
          // ↑ ".timesUsed" = le champ à incrémenter
          // ↑ 1 = incrémenter de 1 (peut être 2, 5, -1, etc.)
        },

        // ─────────────────────────────────────────────────────
        // 🔄 $set : Remplacer/définir une valeur
        // ─────────────────────────────────────────────────────
        $set: {
          "workouts.$[workout].lastUsedAt": new Date(),
          // ↑ Même placeholder "$[workout]"
          // ↑ On remplace lastUsedAt par la date actuelle
        },

        // ─────────────────────────────────────────────────────
        // ➕ $push : Ajouter un élément à un tableau
        // ─────────────────────────────────────────────────────
        $push: {
          sessions: newSession,
          // ↑ "sessions" = le tableau (à la racine du user)
          // ↑ newSession = l'objet à ajouter à la fin du tableau
        },
      },

      // ═══════════════════════════════════════════════════════
      // 🎯 arrayFilters : Définir les conditions des placeholders
      // ═══════════════════════════════════════════════════════
      {
        arrayFilters: [
          // ↓ Définit ce que signifie "$[workout]" utilisé ci-dessus
          { "workout._id": new ObjectId(templateId) },
          // ↑ "$[workout]" = l'élément du tableau workouts[]
          //    dont le _id correspond à templateId
        ],
      },
    );

    return NextResponse.json(
      {
        success: true,
        sessionId: sessionId.toString(),
        message: "Séance démarrée",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur création session:", error);
    return NextResponse.json(
      { error: "Erreur lors du démarrage de la séance" },
      { status: 500 },
    );
  }
}
