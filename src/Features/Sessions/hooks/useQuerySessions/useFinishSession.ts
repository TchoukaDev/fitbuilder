import { useQueryClient, useMutation } from "@tanstack/react-query";
import { SessionExercise } from "@/types/SessionExercise";
import { WorkoutSession } from "@/types/workoutSession";

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
    const sessionsKey = ["sessions", userId];
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
        await queryClient.cancelQueries({ queryKey: sessionsKey });
        await queryClient.cancelQueries({ queryKey: calendarKey });
        const previousSessions = queryClient.getQueryData(sessionsKey);
        const previousEvents = queryClient.getQueryData(calendarKey);
        queryClient.setQueryData(sessionsKey, (old: WorkoutSession[] = []) => [
          old.map((s: WorkoutSession) =>
            s.id === sessionId ? { ...s, exercises, duration } : s,
          ),
        ]);
        queryClient.setQueryData(calendarKey, (old = []) => [
          old.map((e) =>
            e.resource.id === sessionId
              ? {
                ...e,
                resource: {
                  ...e.resource,
                  exercises,
                  duration,
                  status: "completed",
                  completedDate: new Date(),
                },
              }
              : e,
          ),
        ]);
        return { previousSessions, previousEvents };
      },
      onError: (error, { exercises, duration }, context) => {
        queryClient.setQueryData(sessionsKey, context?.previousSessions);
        queryClient.setQueryData(calendarKey, context?.previousEvents);
        console.error("Erreur finalisation:", error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: sessionsKey });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
      },
    });
  }