export { default } from "next-auth/middleware";
// middleware par defaut de next-auth. Gère seul les routes protégées. Suffisant pour protéger uniquement avec utilisateur connecté

export const config = {
  matcher: [
    /*
     * Protège toutes les routes sauf :
     * - /signup, / ($ = racine du site -> login) (pages publiques)
     * - /api/auth (routes Next-Auth)
     * - /_next, /favicon.ico (fichiers statiques)
     */
    "/((?!api/auth|signup$|$|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};

/*Élément	Signification
/	On commence à la racine du site
(?! ... )	“n’inclut pas ce qui correspond à…” (négation)
api/auth	exclut les routes NextAuth
signup$	exclut la page /signup
$	exclut la page / (car le chemin vide correspond à la racine)
_next/static	exclut les fichiers statiques générés par Next
_next/image	exclut le système d’optimisation d’images
favicon.ico	exclut l’icône du site
`.*\.(?:png	jpg
.* (à la fin)	tout le reste est protégé*/
