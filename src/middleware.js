import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
    signOut: "/",
  },
});

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
