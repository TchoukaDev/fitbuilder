/**
 * Middleware d'authentification pour les routes API
 * Standardise la vérification d'authentification et d'autorisation
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./apiResponse";

export async function requireAuth(req: NextRequest) {
  // getServerSession retourne le type Session de NextAuth (défini dans next-auth.d.ts)
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(ApiError.UNAUTHORIZED, { status: 401 });
  }

  return {
    userId: session.user.id,
    userRole: session.user.role || "USER",
  };
}

/**
 * Vérifie que l'utilisateur est authentifié ET administrateur

 */
export async function requireAdmin(req: NextRequest) {
  const auth = await requireAuth(req);

  // Si requireAuth retourne une erreur, la propager
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (auth.userRole !== "ADMIN") {
    return NextResponse.json(ApiError.ADMIN_ONLY, { status: 403 });
  }

  return auth;
}
