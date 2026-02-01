import { useQueryClient, useMutation } from "@tanstack/react-query";
import { WorkoutSession } from "@/types/workoutSession";
import { SessionsResponse } from "./useGetSessions";
import { toast } from "react-toastify";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: WorkoutSession;
  [key: string]: unknown;
}

interface UpdatedSession {
  scheduledDate?: string;
  estimatedDuration?: number;
  workoutName?: string;
  [key: string]: unknown;
}

interface UpdatePlannedSessionVariables {
  sessionId: string;
  updatedSession: UpdatedSession;
}

/**
 * Modifier une session planifiée
 */
export function useUpdatePlannedSession(userId: string) {
  const queryClient = useQueryClient();
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation({
    mutationFn: async ({ sessionId, updatedSession }: UpdatePlannedSessionVariables) => {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", updatedSession }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur modification",
        );
      }
      return response.json();
    },

    onMutate: async ({ sessionId, updatedSession }: UpdatePlannedSessionVariables) => {
      // Cancel toutes les queries
      await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
      await queryClient.cancelQueries({ queryKey: calendarKey });

      // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
      const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
        queryKey: ["sessions", userId] 
      });

      // ✅ Mise à jour optimiste des sessions
      sessionsQueries.forEach(([key, data]) => {
        if (data?.sessions) {
          queryClient.setQueryData(key, {
            ...data,
            sessions: data.sessions.map((s: WorkoutSession) =>
              s.id === sessionId 
                ? { ...s, ...updatedSession } 
                : s
            ),
          });
        }
      });

      // ✅ Calendar - mise à jour optimiste
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);
      if (previousEvents && updatedSession.scheduledDate) {
        const start = new Date(updatedSession.scheduledDate);
        const durationMs = (updatedSession.estimatedDuration || 60) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);

        queryClient.setQueryData(calendarKey, 
          previousEvents.map((e: CalendarEvent) =>
            e.resource?.id === sessionId
              ? {
                  ...e,
                  title: updatedSession.workoutName || e.title,
                  start: start,
                  end: end,
                  resource: { ...e.resource, ...updatedSession },
                }
              : e
          )
        );
      }

      return { sessionsQueries, previousEvents };
    },

    onError: (error, _variables, context) => {
      console.error("Erreur modification:", error);
      // ✅ Rollback toutes les queries sessions
      context?.sessionsQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      // ✅ Rollback calendar
      if (context?.previousEvents) {
        queryClient.setQueryData(calendarKey, context.previousEvents);
      }
      toast.error("Erreur lors de la modification de la séance");
    },

    onSuccess: () => {
      toast.success("Séance modifiée avec succès");
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
