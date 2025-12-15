import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useCallback } from "react";

/**
 * Récupère la liste des workouts pour un utilisateur via React Query.
 *
 * @param {any[]} initialData - Données initiales optionnelles pour hydrater le cache.
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useWorkouts(initialData, userId, options = {}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["workouts", userId],
    queryFn: async () => {
      const response = await fetch("/api/workouts");

      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data = await response.json();

      return data || [];
    },
    initialData: initialData,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!userId,
    ...options,
  });

  // ✅ Prefetch au survol du bouton dans calendrier
  const prefetchWorkouts = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["workouts", userId],
      queryFn: async () => {
        const response = await fetch("/api/workouts");
        const data = await response.json();
        console.log("Prefetched workouts:", data);
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient, userId]);
  return { ...query, prefetchWorkouts };
}

// CREATE
/**
 * Crée un workout pour un utilisateur (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useCreateWorkout(userId) {
  const queryClient = useQueryClient();
  const key = ["workouts", userId];

  return useMutation({
    mutationFn: async (newWorkout) => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorkout),
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
    onMutate: async (newWorkout) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousWorkouts = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old) => {
        return [
          ...(old || []),
          {
            ...newWorkout,
            _id: `temp-${Date.now()}`,
            createdAt: new Date(),
          },
        ];
      });

      return { previousWorkouts };
    },
    onSuccess: () => {
      toast.success("Votre entraînement a été créé avec succès.");
    },

    onError: (err, newWorkout, context) => {
      queryClient.setQueryData(key, context.previousWorkouts);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

// UPDATE
/**
 * Met à jour un workout existant pour un utilisateur (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useUpdateWorkout(userId) {
  const queryClient = useQueryClient();
  const key = ["workouts", userId];
  return useMutation({
    mutationFn: async ({ id, updatedWorkout }) => {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWorkout),
      });
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

    // 🔥 RENDU OPTIMISTE
    onMutate: async ({ id, updatedWorkout }) => {
      // 1. Annule les requêtes en cours
      await queryClient.cancelQueries({ queryKey: key });

      // 2. Sauvegarde l'état actuel
      const previousWorkouts = queryClient.getQueryData(key);

      // 3. Met à jour IMMÉDIATEMENT le cache
      queryClient.setQueryData(key, (old) => {
        if (!old) return old;
        return old.map((w) => (w._id === id ? { ...w, ...updatedWorkout } : w));
      });

      return { previousWorkouts };
    },

    // ❌ Si erreur → ROLLBACK
    onError: (err, variables, context) => {
      queryClient.setQueryData(key, context?.previousWorkouts);
    },
    onSuccess: () => {
      toast.success("Votre entraînement a été modifié avec succès.");
    },
    // ✅ Sync avec serveur après succès/erreur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

// DELETE
/**
 * Supprime un workout pour un utilisateur (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useDeleteWorkout(userId) {
  const queryClient = useQueryClient();
  const key = ["workouts", userId];
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }
    },
    onMutate: async (id) => {
      queryClient.cancelQueries({ queryKey: key });
      const previousWorkouts = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old = []) =>
        old.filter((w) => w._id !== id),
      );

      return { previousWorkouts };
    },
    onError: (err, id, context) =>
      queryClient.setQueryData(key, context?.previousWorkouts),
    onSuccess: () => {
      toast.success("Entraînement supprimé avec succès");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
