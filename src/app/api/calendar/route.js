import { requireAuth } from "@/libs/authMiddleware";
import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { ApiError } from "@/libs/apiResponse";
import { revalidatePath } from "next/cache";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // ✅ Optionnel

  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { sessions: 1 } });

    if (!user) {
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), {
        status: 404,
      });
    }

    let sessions = user.sessions || [];

    // ✅ Filtrer par statut si paramètre fourni
    if (statusFilter) {
      sessions = sessions.filter((s) => s.status === statusFilter);
    }

    return NextResponse.json(
      {
        success: true,
        sessions: sessions,
        count: sessions.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur GET sessions:", error);
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
