import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import { ApiError } from "@/libs/apiResponse";
import { requireAuth } from "@/libs/authMiddleware";
import { StatsRepository } from "@/repositories/StatsRepository";
import { StatsService } from "@/services/StatsService";
import { NotFoundError } from "@/libs/ServicesErrors";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { userId } = auth;

  try {
    const db = await connectDB();
    const service = new StatsService(new StatsRepository(db));
    const data = await service.getStats(userId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError)
      return NextResponse.json(ApiError.NOT_FOUND("Utilisateur"), { status: 404 });
    return NextResponse.json(ApiError.SERVER_ERROR, { status: 500 });
  }
}
