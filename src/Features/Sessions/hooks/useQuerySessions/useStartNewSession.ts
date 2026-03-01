import { ApiErrorType } from "@/libs/apiResponse";
import { WorkoutExercise } from "@/types/workoutExercise";
import { WorkoutSession } from "@/types/workoutSession";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { SessionsResponse } from "./useGetSessions";
import { CalendarEvent } from "@/types/calendarEvent";

type UseStartNewSessionVariables = {
  workoutId: string;
  workoutName: string;
  exercises: WorkoutExercise[];
}

type MutationContext = {
  sessionsQueries: [readonly unknown[], SessionsResponse | undefined][];
  previousEvents: CalendarEvent[] | undefined;
}

/**
 * Créer et démarrer une nouvelle session d'entraînement (mutation React Query).
 */
export function useStartNewSession(userId: string) {
  const queryClient = useQueryClient();
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation<{ sessionId: string }, ApiErrorType, UseStartNewSessionVariables, MutationContext>({
    mutationFn: async (newSession: UseStartNewSessionVariables) => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
      if (!response.ok) {
        const errorData: ApiErrorType = await response.json();
        throw new Error(
          errorData.message ||
          errorData.error ||
          "Erreur lors de la création de la séance",
        );
      }
      const data: { sessionId: string } = await response.json();
      return data;
    },

    onMutate: async (newSession: UseStartNewSessionVariables) => {
      // Cancel toutes les queries
      await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
      await queryClient.cancelQueries({ queryKey: calendarKey });
      await queryClient.cancelQueries({ queryKey: dashboardKey });

      // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
      const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
        queryKey: ["sessions", userId] 
      });

      // ✅ Mise à jour optimiste - ajouter la nouvelle session (temporaire)
      const tempSession = {
        ...newSession,
        id: `temp-${Date.now()}`,
        status: "in-progress",
        createdAt: new Date(),
      } as unknown as WorkoutSession;

      sessionsQueries.forEach(([key, data]) => {
        if (data?.sessions) {
          queryClient.setQueryData(key, {
            ...data,
            sessions: [tempSession, ...data.sessions],
          });
        }
      });

      // ✅ Calendar - pas de mise à jour optimiste car session démarrée immédiatement
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);

      return { sessionsQueries, previousEvents };
    },

    onError: (error, _newSession, context) => {
      console.error("Erreur création session:", error);

      // ✅ Rollback calendar
      if (context?.previousEvents) {
        queryClient.setQueryData(calendarKey, context.previousEvents);
      }
      // ✅ Rollback toutes les queries sessions
      context?.sessionsQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key as readonly unknown[], data);
      });
      toast.error("Erreur lors de la création de la séance");
    },

    onSuccess: () => {
      toast.success("L'entraînement a démarré, bon courage! 💪");
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["workouts", userId] });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
