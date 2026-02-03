import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { WorkoutSession } from "@/types/workoutSession";
import { SessionsResponse } from "./useGetSessions";
import { CalendarEvent } from "@/types/calendarEvent";
import { getColorByStatus } from "@/Features/Calendar/utils";


/**
 * Démarrer une session planifiée
 */
export function useStartPlannedSession(userId: string) {
  const queryClient = useQueryClient();
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      if (!res.ok) throw new Error("Erreur démarrage");
      return res.json();
    },

    onMutate: async (sessionId: string) => {
      // Cancel toutes les queries
      await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
      await queryClient.cancelQueries({ queryKey: calendarKey });

      // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
      const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
        queryKey: ["sessions", userId] 
      });

      // ✅ Mise à jour optimiste - changer le status en "in-progress"
      sessionsQueries.forEach(([key, data]) => {
        if (data?.sessions) {
          queryClient.setQueryData(key, {
            ...data,
            sessions: data.sessions.map((s: WorkoutSession) =>
              s.id === sessionId 
                ? { ...s, status: "in-progress", startedAt: new Date() } 
                : s
            ),
          });
        }
      });

      // ✅ Calendar - mise à jour optimiste
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);
      if (previousEvents) {
        const { color, colorHover } = getColorByStatus("in-progress");
        queryClient.setQueryData(calendarKey, 
          previousEvents.map((e: CalendarEvent) =>
            e.resource?.id === sessionId
              ? {
                  ...e,
                  color,
                  colorHover,
                  resource: {
                    ...e.resource,
                    status: "in-progress",
                    startedAt: new Date(),
                  },
                }
              : e
          )
        );
      }

      return { sessionsQueries, previousEvents };
    },

    onError: (error, _sessionId, context) => {
      console.error("Erreur démarrage:", error);
      // ✅ Rollback toutes les queries sessions
      context?.sessionsQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      // ✅ Rollback calendar
      if (context?.previousEvents) {
        queryClient.setQueryData(calendarKey, context.previousEvents);
      }
      toast.error("Erreur lors du démarrage de la séance");
    },

    onSuccess: () => {
      toast.success("Séance démarrée !");
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
