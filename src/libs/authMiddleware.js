/**
 * Middleware d'authentification pour les routes API
 * Standardise la vérification d'authentification et d'autorisation
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { ApiError } from "./apiResponse";

/**
 * Vérifie que l'utilisateur est authentifié
 * @param {Request} req - Requête HTTP
 * @returns {Promise<{userId: string, userRole: string} | NextResponse>}
 */
export async function requireAuth(req) {
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
 * @param {Request} req - Requête HTTP
 * @returns {Promise<{userId: string, userRole: string} | NextResponse>}
 */
export async function requireAdmin(req) {
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
