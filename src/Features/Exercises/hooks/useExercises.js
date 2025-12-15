// hooks/useExercices.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * Récupère la liste des exercices (globale ou filtrée par utilisateur).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {boolean} isAdmin - Indique si l'utilisateur est admin.
 * @param {any[]} initialData - Données initiales pour hydrater le cache.
 */
export function useExercises(userId, isAdmin, initialData) {
  const key = isAdmin ? ["exercises"] : ["exercises", userId];

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await fetch("/api/exercises");
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data = await response.json();
      return data;
    },
    initialData: initialData,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // ✅ 5 minutes - Pas de refetch immédiat
    gcTime: 1000 * 60 * 60,
    enabled: !!userId,
  });
}

// 2️⃣ Hook pour CRÉER un exercice
/**
 * Crée un nouvel exercice (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {boolean} isAdmin - Indique si l'utilisateur est admin.
 */
export function useCreateExercise(userId, isAdmin) {
  const queryClient = useQueryClient();
  const key = isAdmin ? ["exercises"] : ["exercises", userId];

  return useMutation({
    mutationFn: async (newExercice) => {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExercice),
      });
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json();
    },

    // 🔥 RENDU OPTIMISTE
    onMutate: async (newExercice) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousExercices = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old) => {
        return [
          ...(old || []),
          {
            ...newExercice,
            type: isAdmin ? "public" : "private",
            _id: `temp-${Date.now()}`,
          },
        ];
      });

      return { previousExercices };
    },
    onSuccess: () => {
      toast.success("Exercice créé avec succès");
    },

    onError: (err, newExercice, context) => {
      queryClient.setQueryData(key, context.previousExercices);
      throw new Error("Erreur:", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

// Hook pour MODIFIER un exercice
/**
 * Met à jour un exercice existant (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {boolean} isAdmin - Indique si l'utilisateur est admin.
 */
export function useUpdateExercise(userId, isAdmin) {
  const queryClient = useQueryClient();
  const key = isAdmin ? ["exercises"] : ["exercises", userId];

  return useMutation({
    mutationFn: async ({ id, updatedExercise }) => {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedExercise),
      });
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json();
    },

    // 🔥 RENDU OPTIMISTE
    onMutate: async ({ id, updatedExercise }) => {
      // 1. Annule les requêtes en cours
      await queryClient.cancelQueries({ queryKey: key });

      // 2. Sauvegarde l'état actuel
      const previousExercices = queryClient.getQueryData(key);

      // 3. Met à jour IMMÉDIATEMENT le cache
      queryClient.setQueryData(key, (old) => {
        if (!old) return old;
        return old.map((ex) =>
          ex._id === id ? { ...ex, ...updatedExercise } : ex,
        );
      });

      return { previousExercices };
    },

    // ❌ Si erreur → ROLLBACK
    onError: (err, variables, context) => {
      queryClient.setQueryData(key, context?.previousExercices);
    },
    onSuccess: () => {
      toast.success("Exercice modifié avec succès");
    },
    // ✅ Sync avec serveur après succès/erreur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

// DELETE
/**
 * Supprime un exercice (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {boolean} isAdmin - Indique si l'utilisateur est admin.
 */
export function useDeleteExercise(userId, isAdmin) {
  const queryClient = useQueryClient();
  const key = isAdmin ? ["exercises"] : ["exercises", userId];
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json();
    },
    onMutate: async (id) => {
      queryClient.cancelQueries({ queryKey: key });
      const previousExercices = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) =>
        old.filter((ex) => ex._id !== id),
      );

      return { previousExercices };
    },
    onSuccess: () => {
      toast.success("Exercice supprimé avec succès");
    },
    onError: (err, id, context) =>
      queryClient.setQueryData(key, context?.previousExercices),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

// READ - Récupérer les favoris
/**
 * Récupère les exercices favoris d'un utilisateur.
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {string[]} initialData - Tableau initial d'identifiants favoris.
 */
export function useFavorites(userId, initialData) {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const response = await fetch("/api/exercises/favorites");
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data = await response.json();

      return data.favoritesExercises || []; // ✅ Retourne le tableau directement
    },
    initialData: initialData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    enabled: !!userId,
  });
}

// TOGGLE - Ajouter ou retirer un favori
/**
 * Ajoute ou retire un exercice des favoris (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useToggleFavorite(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    // ✅ mutationFn reçoit UN SEUL objet
    mutationFn: async ({ exerciseId, isFavorite }) => {
      const response = await fetch("/api/exercises/favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          action: isFavorite ? "remove" : "add",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data = await response.json();

      return data.favoritesExercises || [];
    },

    // ✅ onMutate reçoit le même objet
    onMutate: async ({ exerciseId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", userId] });

      const previousFavorites = queryClient.getQueryData(["favorites", userId]);

      // Mise à jour optimiste
      queryClient.setQueryData(["favorites", userId], (old = []) => {
        if (isFavorite) {
          // Retirer
          return old.filter((id) => id !== exerciseId);
        } else {
          // Ajouter
          return [...old, exerciseId];
        }
      });

      return { previousFavorites };
    },

    onError: (err, variables, context) => {
      // Rollback en cas d'erreur
      queryClient.setQueryData(
        ["favorites", userId],
        context?.previousFavorites,
      );
      throw new Error("Erreur toggle favori:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });
}
