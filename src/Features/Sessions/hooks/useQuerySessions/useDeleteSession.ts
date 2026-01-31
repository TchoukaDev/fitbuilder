import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ApiErrorType } from "@/libs/apiResponse";
import { WorkoutSession } from "@/types/workoutSession";
import { SessionsResponse } from "./useGetSessions";

/**
 * Supprimer une session d'entraînement (mutation React Query).
 */

type UseDeleteSessionProps = {
  userId: string;
  statusFilter: string | null;
}


export function useDeleteSession({ userId, statusFilter = null }: UseDeleteSessionProps) {
    const queryClient = useQueryClient();
    const calendarKey = ["calendar-sessions", userId, statusFilter || null];
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
  
        // Récupérer TOUTES les queries sessions (avec leurs filtres)
        const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ queryKey: ["sessions", userId] });
  
        // Mise à jour optimiste sur TOUTES les variantes
        sessionsQueries.forEach(([key, data]) => {
          if (data?.sessions) {
            queryClient.setQueryData(key, {
              ...data,
              sessions: data.sessions.filter((s: WorkoutSession) => s.id !== id),
            });
          }
        });
  
        // Calendar
        const previousEvents = queryClient.getQueryData(calendarKey);
        queryClient.setQueryData(calendarKey, (old = []) =>
          old.filter((e) => e.resource.id !== id)
        );
  
        return { sessionsQueries, previousEvents };
      },
  
      onError: (error, id, context) => {
        // Rollback toutes les queries sessions
        context?.sessionsQueries?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        queryClient.setQueryData(calendarKey, context?.previousEvents);
      },
  
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
      },
    });
  }
  