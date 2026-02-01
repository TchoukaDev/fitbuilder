import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ApiErrorType } from "@/libs/apiResponse";
import { WorkoutSession } from "@/types/workoutSession";
import { SessionsResponse } from "./useGetSessions";
import { toast } from "react-toastify";

/**
 * Supprimer une session d'entraînement (mutation React Query).
 */

type UseDeleteSessionProps = {
  userId: string;
}

interface CalendarEvent {
  id: string;
  resource: WorkoutSession;
  [key: string]: unknown;
}

export function useDeleteSession({ userId }: UseDeleteSessionProps) {
  const queryClient = useQueryClient();
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData: ApiErrorType = await response.json();
        throw new Error(errorData.message || errorData.error || "Erreur suppression");
      }
      return response.json();
    },

    onMutate: async (id) => {
      // Cancel toutes les queries sessions
      await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
      await queryClient.cancelQueries({ queryKey: calendarKey });

      // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
      const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
        queryKey: ["sessions", userId] 
      });

      // ✅ Mise à jour optimiste sur TOUTES les variantes
      sessionsQueries.forEach(([key, data]) => {
        if (data?.sessions) {
          queryClient.setQueryData(key, {
            ...data,
            sessions: data.sessions.filter((s: WorkoutSession) => s.id !== id),
          });
        }
      });

      // ✅ Calendar - mise à jour optimiste
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);
      if (previousEvents) {
        queryClient.setQueryData(calendarKey, 
          previousEvents.filter((e: CalendarEvent) => e.resource?.id !== id)
        );
      }

      return { sessionsQueries, previousEvents };
    },

    onError: (error, _id, context) => {
      console.error("Erreur suppression:", error);
      // ✅ Rollback toutes les queries sessions
      context?.sessionsQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      // ✅ Rollback calendar
      if (context?.previousEvents) {
        queryClient.setQueryData(calendarKey, context.previousEvents);
      }
      toast.error("Erreur lors de la suppression");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
