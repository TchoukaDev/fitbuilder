// API Route pour la gestion des séances d'entraînement (création et récupération avec filtres/pagination)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { getAllSessions } from "@/Features/Sessions/utils";
import { DEFAULT_SESSION_FILTERS } from "@/Features/Sessions/utils/sessionFilters";
import { SessionRepository } from "@/repositories/SessionRepository";
import { SessionService } from "@/services/SessionService";
import { NotFoundError, ValidationError } from "@/libs/ServicesErrors";

// POST - Démarrer une nouvelle séance à partir d'un plan d'entraînement
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { workoutId, workoutName, exercises, scheduledDate, estimatedDuration, isPlanning } =
    await req.json();

  try {
    const db = await connectDB();
    const service = new SessionService(new SessionRepository(db));

    const sessionId = await service.create(userId, {
      workoutId,
      workoutName,
      exercises,
      scheduledDate,
      estimatedDuration,
      isPlanning,
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidateTag("workouts")
    revalidatePath("/admin");
    revalidateTag("sessions");
    revalidateTag("calendar");

    return NextResponse.json(
      {
        success: true,
        sessionId,
        message: isPlanning ? "Séance planifiée avec succès" : "Séance démarrée avec succès",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ValidationError)
      return NextResponse.json(ApiError.INVALID_DATA(error.message), { status: 400 });
    if (error instanceof NotFoundError)
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// GET - Récupérer les séances avec filtres (statut, date, workout) et pagination
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || DEFAULT_SESSION_FILTERS.page.toString());
  const limit = parseInt(searchParams.get("limit") || DEFAULT_SESSION_FILTERS.limit.toString());
  const status = searchParams.get("status") || DEFAULT_SESSION_FILTERS.status;
  const dateFilter = searchParams.get("dateFilter") || DEFAULT_SESSION_FILTERS.dateFilter;
  const workoutFilter = searchParams.get("workoutFilter") || DEFAULT_SESSION_FILTERS.workoutFilter;

  try {
    const result = await getAllSessions(userId, { page, limit, status, dateFilter, workoutFilter });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
