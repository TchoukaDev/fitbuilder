export { default } from "next-auth/middleware";
// middleware par defaut de next-auth. Gère seul les routes protégées. Suffisant pour protéger uniquement avec utilisateur connecté

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/exercises/:path*",
    "/workouts/:path*",
    "/sessions/:path*",
    "/calendar/:path*",
  ],
};
