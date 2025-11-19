import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { date } from "zod";

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
      exerciseId: ex._id,
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

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
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

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  // Récupérer paramètre url
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 20;
  const status = searchParams.get("status"); // "completed" | "in-progress" | "planned"
  const dateFilter = searchParams.get("dateFilter"); // "week" | "month" | "quarter" | "year"
  const templateFilter = searchParams.get("templateFilter"); //nom des templates

  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    let sessions = user?.sessions || [];

    // ═══════════════════════════════════════════════════════
    // 🔍 FILTRE PAR STATUT
    // ═══════════════════════════════════════════════════════
    if (status && status !== "all") {
      sessions = sessions.filter((s) => s.status === status);
    }

    // ═══════════════════════════════════════════════════════
    // 🔍 FILTRE PAR TEMPLATE
    // ═══════════════════════════════════════════════════════
    if (templateFilter && templateFilter !== "all") {
      sessions = sessions.filter((s) => s.templateName === templateFilter);
    }

    // ═══════════════════════════════════════════════════════
    // 🔍 FILTRE PAR DATE
    // ═══════════════════════════════════════════════════════
    if (dateFilter) {
      const now = new Date();
      let startDate;

      switch (dateFilter) {
        case "week":
          startDate = new Date();
          startDate.setDate(now.getDate() - 7); // Soustraire 7 jours
          break;
        case "month":
          startDate = new Date();
          startDate.setDate(now.getDate() - 30); // Soustraire 30 jours
          break;
        case "quarter":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 3); // Soustraire 3 mois
          break;
        case "year":
          startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 1); // Soustraire 1 an
          break;
      }

      if (startDate) {
        sessions = sessions.filter((s) => {
          const sessionDate = new Date(
            s.completedDate || s.startedAt || s.scheduledDate || s.createdAt,
          );

          // ✅ Comparaison de 2 objets Date
          return sessionDate >= startDate;
        });
      }
    }

    // ═══════════════════════════════════════════════════════
    // 📊 TRIER (plus récent en premier)
    // ═══════════════════════════════════════════════════════
    sessions.sort((a, b) => {
      const dateA = new Date(a.completedDate || a.startedAt || a.createdAt);
      const dateB = new Date(b.completedDate || b.startedAt || b.createdAt);
      return dateB - dateA;
    });

    // ✅ Pagination
    const totalSessions = sessions.length; // Ex: 100 sessions

    const startIndex = (page - 1) * limit;
    // Page 1 : (1-1) * 20 = 0   → Commence à l'index 0
    // Page 2 : (2-1) * 20 = 20  → Commence à l'index 20
    // Page 3 : (3-1) * 20 = 40  → Commence à l'index 40

    const endIndex = startIndex + limit;
    // Page 1 : 0 + 20 = 20   → Termine à l'index 20
    // Page 2 : 20 + 20 = 40  → Termine à l'index 40

    // ✅ Extraire SEULEMENT les sessions de cette page
    const sessionsForThisPage = sessions.slice(startIndex, endIndex);
    // .slice(20, 40) retourne les éléments de l'index 20 à 39 (40 exclus)

    const totalPages = Math.ceil(totalSessions / limit);
    // 100 sessions / 20 par page = 5 pages
    // Math.ceil() arrondit au supérieur (si 101 sessions → 6 pages)

    const hasNextPage = page < totalPages;
    // Page 2 < 5 pages → true (il y a une page 3)
    // Page 5 < 5 pages → false (c'est la dernière)

    const hasPreviousPage = page > 1;
    // Page 2 > 1 → true (il y a une page 1 avant)
    // Page 1 > 1 → false (c'est la première)

    // ═══════════════════════════════════════════════════════
    // ✅ SÉRIALISER (ObjectId → string, Date → ISO string)
    // ═══════════════════════════════════════════════════════
    const serializedSessions = sessionsForThisPage.map((s) => ({
      ...s,
      _id: s._id.toString(),
      userId: s.userId.toString(),
      templateId: s.templateId.toString(),
      // ✅ Sérialiser TOUTES les dates
      createdAt: s.createdAt?.toISOString?.() || s.createdAt,
      updatedAt: s.updatedAt?.toISOString?.() || s.updatedAt,
      startedAt: s.startedAt?.toISOString?.() || s.startedAt,
      completedDate: s.completedDate?.toISOString?.() || s.completedDate,
      scheduledDate: s.scheduledDate?.toISOString?.() || s.scheduledDate,
    }));

    // ═══════════════════════════════════════════════════════
    // 📈 STATS (calculées sur TOUTES les sessions de l'user)
    // ═══════════════════════════════════════════════════════
    const allUserSessions = user?.sessions || [];
    const stats = {
      total: allUserSessions.length,
      completed: allUserSessions.filter((s) => s.status === "completed").length,
      inProgress: allUserSessions.filter((s) => s.status === "in-progress")
        .length,
      planned: allUserSessions.filter((s) => s.status === "planned").length,
    };

    // ═══════════════════════════════════════════════════════
    // 🎉 RETOUR
    // ═══════════════════════════════════════════════════════
    return NextResponse.json(
      {
        sessions: serializedSessions,
        pagination: {
          page,
          limit,
          totalSessions,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        stats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur GET sessions:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la récupération des sessions",
      },
      { status: 500 },
    );
  }
}
