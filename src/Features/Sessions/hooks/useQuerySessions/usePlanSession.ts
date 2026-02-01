import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getColorByStatus } from "@/Features/Calendar/utils";
import { WorkoutSession } from "@/types/workoutSession";
import { SessionsResponse } from "./useGetSessions";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: WorkoutSession;
  color: string;
  colorHover: string;
  [key: string]: unknown;
}

interface NewSession {
  workoutId: string;
  workoutName: string;
  scheduledDate: string;
  estimatedDuration?: number;
  [key: string]: unknown;
}

/**
 * Planifie une nouvelle session d'entraînement
 */
export function usePlanSession(userId: string) {
  const queryClient = useQueryClient();
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];

  return useMutation({
    mutationFn: async (newSession: NewSession) => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erreur planification",
        );
      }

      return response.json();
    },

    onMutate: async (newSession: NewSession) => {
      // Cancel toutes les queries
      await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
      await queryClient.cancelQueries({ queryKey: calendarKey });
      await queryClient.cancelQueries({ queryKey: dashboardKey });

      // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
      const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
        queryKey: ["sessions", userId] 
      });

      // ✅ Créer une session temporaire
      const tempSession = {
        ...newSession,
        id: `temp-${Date.now()}`,
        status: "planned",
        createdAt: new Date(),
      } as unknown as WorkoutSession;

      // ✅ Mise à jour optimiste des sessions
      sessionsQueries.forEach(([key, data]) => {
        if (data?.sessions) {
          queryClient.setQueryData(key, {
            ...data,
            sessions: [tempSession, ...data.sessions],
          });
        }
      });

      // ✅ Calendar - créer un événement temporaire
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);
      const scheduledDate = new Date(newSession.scheduledDate);
      const durationMs = (newSession.estimatedDuration || 60) * 60 * 1000;
      const tempEvent: CalendarEvent = {
        id: `temp-${Date.now()}`,
        title: newSession.workoutName,
        start: scheduledDate,
        end: new Date(scheduledDate.getTime() + durationMs),
        resource: tempSession,
        color: getColorByStatus("planned").color,
        colorHover: getColorByStatus("planned").colorHover,
      };

      if (previousEvents) {
        queryClient.setQueryData(calendarKey, [...previousEvents, tempEvent]);
      } else {
        queryClient.setQueryData(calendarKey, [tempEvent]);
      }

      return { sessionsQueries, previousEvents };
    },

    onError: (error, _newSession, context) => {
      console.error("Erreur planification:", error);
      // ✅ Rollback toutes les queries sessions
      context?.sessionsQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      // ✅ Rollback calendar
      if (context?.previousEvents) {
        queryClient.setQueryData(calendarKey, context.previousEvents);
      }
      toast.error("Erreur lors de la planification de la séance");
    },

    onSuccess: () => {
      toast.success("Séance planifiée avec succès");
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
