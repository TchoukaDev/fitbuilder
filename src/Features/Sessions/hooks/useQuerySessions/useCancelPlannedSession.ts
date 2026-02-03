import { ApiErrorType } from "@/libs/apiResponse";
import { WorkoutSession } from "@/types/workoutSession";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { SessionsResponse } from "./useGetSessions";
import { getColorByStatus } from "@/Features/Calendar/utils";
import { CalendarEvent } from "@/types/calendarEvent";



/**
 * Annuler une session planifiée
 */
export function useCancelPlannedSession(userId: string) {
  const queryClient = useQueryClient();
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur annulation",
        );
      }

      return response.json();
    },

    onMutate: async (sessionId: string) => {
      // Cancel toutes les queries
      await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
      await queryClient.cancelQueries({ queryKey: calendarKey });

      // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
      const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
        queryKey: ["sessions", userId] 
      });

      // ✅ Mise à jour optimiste - changer le status en "planned"
      sessionsQueries.forEach(([key, data]) => {
        if (data?.sessions) {
          queryClient.setQueryData(key, {
            ...data,
            sessions: data.sessions.map((s: WorkoutSession) =>
              s.id === sessionId 
                ? { ...s, status: "planned" } 
                : s
            ),
          });
        }
      });

      // ✅ Calendar - mise à jour optimiste (passer l'événement en status "planned")
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);
      if (previousEvents) {
        const { color, colorHover } = getColorByStatus("planned");
        queryClient.setQueryData(calendarKey, 
          previousEvents.map((e: CalendarEvent) =>
            e.resource?.id === sessionId
              ? { 
                  ...e, 
                  color,      // ✅ Mettre à jour la couleur
                  colorHover, // ✅ Mettre à jour la couleur hover
                  resource: { ...e.resource, status: "planned" } 
                }
              : e
          )
        );
      }

      return { sessionsQueries, previousEvents };
    },

    onError: (error: ApiErrorType, _sessionId, context) => {
      console.error("Erreur annulation:", error);
      // ✅ Rollback toutes les queries sessions
      context?.sessionsQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      // ✅ Rollback calendar
      if (context?.previousEvents) {
        queryClient.setQueryData(calendarKey, context.previousEvents);
      }
      toast.error(error.message || error.error || "Erreur lors de l'annulation de la séance");
    },

    onSuccess: () => {
      toast.success("Séance annulée avec succès");
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
