// hooks/useExercices.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Exercise } from "@/types/exercise";
import { ExerciseFormData } from "../utils/ExerciseSchema";

// ========== Types pour les réponses API ==========
type ApiError = {
  message: string;
  error: string;
};

type ExercisesApiResponse = Exercise[];

/**
 * Récupère la liste des exercices (globale ou filtrée par utilisateur).
 */

type UseExercisesProps = {
  userId: string;
  isAdmin: boolean;
  initialData: Exercise[];
};

export function useExercises({ userId, isAdmin, initialData }: UseExercisesProps) {
  const key = isAdmin ? ["exercises"] : ["exercises", userId];

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await fetch("/api/exercises");
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data: ExercisesApiResponse = await response.json();
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
 */

type UseCreateExerciseProps = {
  userId: string;
  isAdmin: boolean;
};

export function useCreateExercise({ userId, isAdmin }: UseCreateExerciseProps) {
  const queryClient = useQueryClient();
  const key = isAdmin ? ["exercises"] : ["exercises", userId];
  const dashboardKey = ["dashboard", userId];
  return useMutation({
    mutationFn: async (newExercise: ExerciseFormData) => {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExercise),
      });
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json() as Promise<Exercise>;
    },

    // 🔥 RENDU OPTIMISTE
    onMutate: async (newExercise: ExerciseFormData) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousExercices = queryClient.getQueryData<Exercise[]>(key);

      queryClient.setQueryData(key, (old: Exercise[] = []) => {
        return [
          ...old,
          {
            ...newExercise,
            isPublic: isAdmin,
            exerciseId: `temp-${Date.now()}`,
          },
        ];
      });

      return { previousExercices };
    },
    onSuccess: () => {
      toast.success("Exercice créé avec succès");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },

    onError: (err, newExercise, context?: { previousExercices?: Exercise[] }) => {
      queryClient.setQueryData(key, context?.previousExercices);
      throw new Error("Erreur:", err);
    },
  });
}

// Hook pour MODIFIER un exercice
/**
 * Met à jour un exercice existant (mutation React Query).
 */

type UseUpdateExerciseProps = {
  userId: string;
  isAdmin: boolean;
};

type UpdateExercisePayload = {
  exerciseId: string;
  updatedExercise: ExerciseFormData;
};

export function useUpdateExercise({ userId, isAdmin }: UseUpdateExerciseProps) {
  const queryClient = useQueryClient();
  const key = isAdmin ? ["exercises"] : ["exercises", userId];
  const dashboardKey = ["dashboard", userId];
  return useMutation({
    mutationFn: async ({ exerciseId, updatedExercise }: UpdateExercisePayload) => {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedExercise),
      });
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json() as Promise<Exercise>;
    },

    // 🔥 RENDU OPTIMISTE
    onMutate: async ({ exerciseId, updatedExercise }: UpdateExercisePayload) => {
      // 1. Annule les requêtes en cours
      await queryClient.cancelQueries({ queryKey: key });

      // 2. Sauvegarde l'état actuel
      const previousExercices = queryClient.getQueryData<Exercise[]>(key);

      // 3. Met à jour IMMÉDIATEMENT le cache
      queryClient.setQueryData(key, (old: Exercise[] = []) => {
        return old.map((ex) =>
          ex.exerciseId === exerciseId ? { ...ex, ...updatedExercise } : ex,
        );
      });

      return { previousExercices };
    },

    // ❌ Si erreur → ROLLBACK
    onError: (err: Error, variables: UpdateExercisePayload, context?: { previousExercices?: Exercise[] }) => {
      queryClient.setQueryData(key, context?.previousExercices);
    },
    onSuccess: () => {
      toast.success("Exercice modifié avec succès");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}

// DELETE
/**
 * Supprime un exercice (mutation React Query).
 */

type UseDeleteExerciseProps = {
  userId: string;
  isAdmin: boolean;
};

export function useDeleteExercise({ userId, isAdmin }: UseDeleteExerciseProps) {
  const queryClient = useQueryClient();
  const key = isAdmin ? ["exercises"] : ["exercises", userId];
  const dashboardKey = ["dashboard", userId];
  return useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json();
    },
    onMutate: async (exerciseId: string) => {
      queryClient.cancelQueries({ queryKey: key });
      const previousExercices = queryClient.getQueryData<Exercise[]>(key);
      queryClient.setQueryData(key, (old: Exercise[] = []) =>
        old.filter((ex) => ex.exerciseId !== exerciseId),
      );

      return { previousExercices };
    },
    onSuccess: () => {
      toast.success("Exercice supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
    onError: (err: Error, variables: string, context?: { previousExercices?: Exercise[] }) =>
      queryClient.setQueryData(key, context?.previousExercices),
  });
}

// READ - Récupérer les favoris
/**
 * Récupère les exercices favoris d'un utilisateur.
 */

type FavoritesApiResponse = {
  favoritesExercises: string[];
};

type UseFavoritesProps = {
  userId: string;
  initialData: string[];
};

export function useFavorites({ userId, initialData }: UseFavoritesProps) {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const response = await fetch("/api/exercises/favorites");
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data: FavoritesApiResponse = await response.json();
      return data.favoritesExercises || [];
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


type ToggleFavoritePayload = {
  exerciseId: string;
  isFavorite: boolean;
};

export function useToggleFavorite(userId: string) {
  const queryClient = useQueryClient();
  const favoritesKey = ["favorites", userId];

  return useMutation({
    mutationFn: async ({ exerciseId, isFavorite }: ToggleFavoritePayload) => {
      const response = await fetch("/api/exercises/favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          action: isFavorite ? "remove" : "add",
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data: FavoritesApiResponse = await response.json();
      return data.favoritesExercises || [];
    },

    onMutate: async ({ exerciseId, isFavorite }: ToggleFavoritePayload) => {
      await queryClient.cancelQueries({ queryKey: favoritesKey });

      const previousFavorites = queryClient.getQueryData<string[]>(
        favoritesKey,
      );

      // Mise à jour optimiste
      queryClient.setQueryData(favoritesKey, (old: string[] = []) => {
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

    onError: (err, variables, context?: { previousFavorites?: string[] }) => {
      // Rollback en cas d'erreur
      queryClient.setQueryData(favoritesKey, context?.previousFavorites);
      throw new Error("Erreur toggle favori:", err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKey });
    },
  });
}
