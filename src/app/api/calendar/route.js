import { requireAuth } from "@/libs/authMiddleware";
import { NextResponse } from "next/server";
import { ApiError } from "@/libs/apiResponse";
import { getCalendarSessions } from "@/Features/Sessions/utils";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // ✅ Optionnel

  try {
    // ✅ Utilise le helper qui retourne WorkoutSession[] avec id (pas _id)
    const sessions = await getCalendarSessions(userId, statusFilter);

    return NextResponse.json(
      {
        success: true,
        sessions,
        count: sessions.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur GET sessions:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
