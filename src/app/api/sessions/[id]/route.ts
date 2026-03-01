// API Route pour les opérations sur une séance spécifique (récupération, modification, finalisation, suppression)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, ApiSuccess } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { getSessionbyId } from "@/Features/Sessions/utils";
import { SessionRepository } from "@/repositories/SessionRepository";
import { SessionService } from "@/services/SessionService";
import { NotFoundError, ValidationError } from "@/libs/ServicesErrors";

// GET - Récupérer une séance spécifique
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const { id: sessionId } = await params;

  try {
    const session = await getSessionbyId(userId, sessionId);
    if (!session) return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    return NextResponse.json(session, { status: 200 });
  } catch {
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PATCH - Mettre à jour une séance selon l'action : start | save | cancel | update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const { id: sessionId } = await params;
  const { action, exercises, duration, updatedSession } = await req.json();

  try {
    const db = await connectDB();
    const service = new SessionService(new SessionRepository(db));

    switch (action) {
      // CAS 1: Démarrer une session planifiée
      case "start":
        await service.start(userId, sessionId);

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/calendar");
        revalidateTag("workouts")
        revalidateTag("sessions");
        revalidateTag("calendar");
        return NextResponse.json(ApiSuccess.OPERATION_SUCCESS("Séance démarrée"), { status: 200 });

      // CAS 2: Sauvegarder la progression d'une session en cours
      case "save":
        await service.save(userId, sessionId, exercises, duration);

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/dashboard");
        revalidateTag("workouts")
        revalidatePath("/admin");
        revalidateTag("sessions");
        revalidateTag("calendar");
        return NextResponse.json(ApiSuccess.OPERATION_SUCCESS("Sauvegarde de la progression"), { status: 200 });

      // CAS 3: Annuler une session en cours (remet à "planned" + décrémente les stats)
      case "cancel":
        await service.cancel(userId, sessionId);

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidatePath("/calendar");
        revalidateTag("workouts")
        revalidateTag("sessions");
        revalidateTag("calendar");
        return NextResponse.json(ApiSuccess.OPERATION_SUCCESS("Séance annulée"), { status: 200 });

      // CAS 4: Modifier une session planifiée (dates, workout, exercices)
      case "update":
        await service.updatePlanned(userId, sessionId, updatedSession);

        revalidatePath("/sessions");
        revalidatePath(`/sessions/${sessionId}`);
        revalidateTag("workouts")
        revalidatePath("/calendar");
        revalidateTag("sessions");
        revalidateTag("calendar");
        return NextResponse.json(ApiSuccess.OPERATION_SUCCESS("Session mise à jour"), { status: 200 });

      default:
        return NextResponse.json(
          ApiError.INVALID_DATA("Action non reconnue : start | save | cancel | update"),
          { status: 400 },
        );
    }
  } catch (error) {
    if (error instanceof ValidationError)
      return NextResponse.json(ApiError.INVALID_DATA(error.message), { status: 400 });
    if (error instanceof NotFoundError)
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// PUT - Terminer une séance (status → "completed")
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const { id: sessionId } = await params;
  const { exercises, duration } = await req.json();

  try {
    const db = await connectDB();
    const service = new SessionService(new SessionRepository(db));

    await service.complete(userId, sessionId, exercises, duration);

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidateTag("workouts")
    revalidateTag("sessions");
    revalidateTag("calendar");
    return NextResponse.json(ApiSuccess.OPERATION_SUCCESS("Session terminée"), { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError)
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}

// DELETE - Supprimer une séance et mettre à jour les stats du plan d'entraînement
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;
  const { id: sessionId } = await params;

  try {
    const db = await connectDB();
    const service = new SessionService(new SessionRepository(db));

    await service.delete(userId, sessionId);

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidateTag("workouts")
    revalidateTag("sessions");
    revalidateTag("calendar");
    return NextResponse.json(ApiSuccess.DELETED("Session"), { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError)
      return NextResponse.json(ApiError.NOT_FOUND("Session"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
