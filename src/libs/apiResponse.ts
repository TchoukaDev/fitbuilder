/**
 * Constantes standardisées pour les réponses API
 * Assure la cohérence des messages d'erreur et de succès dans toute l'application
 */

// ═══════════════════════════════════════════════════════
// 🔴 ERREURS API
// ═══════════════════════════════════════════════════════

export const ApiError = {
  // Erreurs d'authentification (401)
  UNAUTHORIZED: {
    error: "Non authentifié",
    message: "Vous devez être connecté pour accéder à cette ressource",
  },

  // Erreurs d'autorisation (403)
  FORBIDDEN: {
    error: "Accès refusé",
    message: "Vous n'avez pas les permissions nécessaires",
  },

  ADMIN_ONLY: {
    error: "Accès refusé",
    message: "Cette action est réservée aux administrateurs",
  },

  // Erreurs de validation (400)
  VALIDATION_ERROR: {
    error: "Données invalides",
    message: "Certains champs sont incorrects ou manquants",
  },

  MISSING_FIELDS: (fields: string[]) => ({
    error: "Champs manquants",
    message: `Veuillez compléter tous les champs obligatoires (${fields.join(
      ", ",
    )})`,
  }),

  INVALID_DATA: (detail: string) => ({
    error: "Données invalides",
    message: detail || "Les données fournies ne sont pas valides",
  }),

  // Erreurs de ressources (404)
  NOT_FOUND: (resource: string) => ({
    error: "Introuvable",
    message: `${resource} introuvable`,
  }),

  // Erreurs de conflit (409)
  ALREADY_EXISTS: (field: string) => ({
    error: "Conflit",
    message: `${field} déjà utilisé`,
  }),

  DUPLICATE: (resource: string) => ({
    error: "Doublon",
    message: `${resource} existe déjà`,
  }),

  // Erreurs serveur (500)
  SERVER_ERROR: {
    error: "Erreur serveur",
    message:
      "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
  },

  DATABASE_ERROR: {
    error: "Erreur de base de données",
    message: "Impossible d'accéder aux données. Veuillez réessayer.",
  },
};

// ═══════════════════════════════════════════════════════
// 🟢 SUCCÈS API
// ═══════════════════════════════════════════════════════

export const ApiSuccess = {
  CREATED: (resource: string) => ({
    success: true,
    message: `${resource} créé avec succès`,
  }),

  UPDATED: (resource: string) => ({
    success: true,
    message: `${resource} mis à jour avec succès`,
  }),

  DELETED: (resource: string) => ({
    success: true,
    message: `${resource} supprimé avec succès`,
  }),

  OPERATION_SUCCESS: (action: string) => ({
    success: true,
    message: `${action} effectué avec succès`,
  }),
};
