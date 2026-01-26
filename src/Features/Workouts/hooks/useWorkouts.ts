import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  QueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { WorkoutExercisesSchemaType, WorkoutSchemaType } from "../utils/workoutSchema";
import { Workout } from "@/types/workout";
import { ApiErrorType } from "@/libs/apiResponse";

/**
 * Récupère la liste des workouts pour un utilisateur via React Query.
 */

interface UseWorkoutsProps {
  initialData: Workout[];
  userId: string;
  options?: QueryOptions
}
export function useWorkouts({ initialData, userId, options = {} }: UseWorkoutsProps): UseQueryResult<Workout[], Error> & { prefetchWorkouts: () => void } {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["workouts", userId],
    queryFn: async () => {
      const response = await fetch("/api/workouts");

      if (!response.ok) {
        const errorData: ApiErrorType = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data: Workout[] = await response.json();

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
  const prefetchWorkouts = useCallback((): void => {
    queryClient.prefetchQuery({
      queryKey: ["workouts", userId],
      queryFn: async () => {
        const response = await fetch("/api/workouts");
        const data: Workout[] = await response.json();
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient, userId]);


  return { ...query, prefetchWorkouts } as UseQueryResult<Workout[], Error> & { prefetchWorkouts: () => void };
}

// CREATE
/**
 * Crée un workout (mutation React Query).
 */
export function useCreateWorkout(userId: string) {
  const queryClient = useQueryClient();
  const key = ["workouts", userId];
  const calendarKey = ["calendar-workouts", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation<Workout, ApiErrorType, WorkoutSchemaType & WorkoutExercisesSchemaType, { previousWorkouts?: Workout[] }>({
    mutationFn: async (newWorkout: WorkoutSchemaType & WorkoutExercisesSchemaType) => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorkout),
      });

      if (!response.ok) {
        const errorData: ApiErrorType = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      return response.json();
    },

    // 🔥 RENDU OPTIMISTE
    onMutate: async (newWorkout: WorkoutSchemaType & WorkoutExercisesSchemaType): Promise<{ previousWorkouts?: Workout[] }> => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousWorkouts = queryClient.getQueryData<Workout[]>(key);

      queryClient.setQueryData(key, (old: Workout[] = []) => {
        return [
          ...(old || []),
          {
            ...newWorkout,
            id: `temp-${Date.now()}`,
            createdAt: new Date(),
          },
        ];
      });

      return { previousWorkouts: previousWorkouts || [] };
    },
    onSuccess: () => {
      toast.success("Votre entraînement a été créé avec succès.");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },

    onError: (err, newWorkout, context?: { previousWorkouts?: Workout[] }) => {
      queryClient.setQueryData(key, context?.previousWorkouts);
    },
  });
}

// UPDATE
/**
 * Met à jour un workout existant pour un utilisateur (mutation React Query).
 */
export function useUpdateWorkout(userId: string) {
  const queryClient = useQueryClient();
  const key = ["workouts", userId];
  const calendarKey = ["calendar-workouts", userId];
  const dashboardKey = ["dashboard", userId];
  return useMutation<Workout, ApiErrorType, { id: string, updatedWorkout: WorkoutSchemaType & WorkoutExercisesSchemaType }, { previousWorkouts?: Workout[] }>({
    mutationFn: async ({ id, updatedWorkout }: { id: string, updatedWorkout: WorkoutSchemaType & WorkoutExercisesSchemaType }) => {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWorkout),
      });
      if (!response.ok) {
        const errorData: ApiErrorType = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }

      const data: Workout = await response.json();
      return data;
    },

    // 🔥 RENDU OPTIMISTE
    onMutate: async ({ id, updatedWorkout }: { id: string, updatedWorkout: WorkoutSchemaType & WorkoutExercisesSchemaType }): Promise<{ previousWorkouts?: Workout[] }> => {
      // 1. Annule les requêtes en cours
      await queryClient.cancelQueries({ queryKey: key });

      // 2. Sauvegarde l'état actuel
      const previousWorkouts = queryClient.getQueryData<Workout[]>(key);

      // 3. Met à jour IMMÉDIATEMENT le cache
      queryClient.setQueryData(key, (old: Workout[] = []) => {
        if (!old) return old;
        return old.map((w) => (w.id === id ? { ...w, ...updatedWorkout } : w));
      });

      return { previousWorkouts };
    },

    // ❌ Si erreur → ROLLBACK
    onError: (err, variables, context?: { previousWorkouts?: Workout[] }) => {
      queryClient.setQueryData(key, context?.previousWorkouts);
    },
    onSuccess: () => {
      toast.success("Votre entraînement a été modifié avec succès.");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}

// DELETE
/**
 * Supprime un workout pour un utilisateur (mutation React Query).

 */
export function useDeleteWorkout(userId: string) {
  const queryClient = useQueryClient();
  const key = ["workouts", userId];
  const calendarKey = ["calendar-workouts", userId];
  const dashboardKey = ["dashboard", userId];
  return useMutation<Workout, ApiErrorType, string, { previousWorkouts?: Workout[] }>({
    mutationFn: async (id: string) => {
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
      return response.json();
    },
    onMutate: async (id: string): Promise<{ previousWorkouts?: Workout[] }> => {
      queryClient.cancelQueries({ queryKey: key });
      const previousWorkouts = queryClient.getQueryData<Workout[]>(key);

      queryClient.setQueryData(key, (old: Workout[] = []) =>
        old.filter((w) => w.id !== id),
      );

      return { previousWorkouts };
    },
    onError: (err, id, context?: { previousWorkouts?: Workout[] }) =>
      queryClient.setQueryData(key, context?.previousWorkouts),
    onSuccess: () => {
      toast.success("Entraînement supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
