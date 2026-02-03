import { useQueryClient, useMutation } from "@tanstack/react-query";
import { SessionExercise } from "@/types/SessionExercise";
import { WorkoutSession } from "@/types/workoutSession";
import { SessionsResponse } from "./useGetSessions";
import { getColorByStatus } from "@/Features/Calendar/utils";
import { CalendarEvent } from "@/types/calendarEvent";

export interface UseFinishSessionType {
  userId: string;
  sessionId: string;
}

type UseFinishSessionVariables = {
  exercises: SessionExercise[];
  duration: string;
}



export function useFinishSession({ userId, sessionId }: UseFinishSessionType) {
    const queryClient = useQueryClient();
    const calendarKey = ["calendar-sessions", userId];
    const dashboardKey = ["dashboard", userId];
    
    return useMutation({
      mutationFn: async ({ exercises, duration }: UseFinishSessionVariables) => {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercises, duration }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || errorData.error || "Erreur finalisation",
          );
        }
        return response.json();
      },

      onMutate: async ({ exercises, duration }) => {
        // Cancel toutes les queries sessions
        await queryClient.cancelQueries({ queryKey: ["sessions", userId] });
        await queryClient.cancelQueries({ queryKey: calendarKey });

        // ✅ Récupérer TOUTES les queries sessions (avec leurs filtres)
        const sessionsQueries = queryClient.getQueriesData<SessionsResponse>({ 
          queryKey: ["sessions", userId] 
        });

        // ✅ Mise à jour optimiste sur TOUTES les variantes de sessions
        sessionsQueries.forEach(([key, data]) => {
          if (data?.sessions) {
            queryClient.setQueryData(key, {
              ...data,
              sessions: data.sessions.map((s: WorkoutSession) =>
                s.id === sessionId 
                  ? { ...s, exercises, duration, status: "completed", completedDate: new Date() } 
                  : s
              ),
            });
          }
        });

        // ✅ Calendar - mise à jour optimiste
        const previousEvents = queryClient.getQueryData<CalendarEvent[]>(calendarKey);
        if (previousEvents) {
          const { color, colorHover } = getColorByStatus("completed");
          queryClient.setQueryData(calendarKey, 
            previousEvents.map((e: CalendarEvent) =>
              e.resource?.id === sessionId
                ? {
                    ...e,
                    color,
                    colorHover,
                    resource: {
                      ...e.resource,
                      exercises,
                      duration,
                      status: "completed",
                      completedDate: new Date(),
                    },
                  }
                : e
            )
          );
        }

        return { sessionsQueries, previousEvents };
      },

      onError: (error, _variables, context) => {
        console.error("Erreur finalisation:", error);
        // ✅ Rollback toutes les queries sessions
        context?.sessionsQueries?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        // ✅ Rollback calendar
        if (context?.previousEvents) {
          queryClient.setQueryData(calendarKey, context.previousEvents);
        }
      },

      onSettled: () => {
        // ✅ Invalider tous les caches après la mutation
        queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
      },
    });
  }