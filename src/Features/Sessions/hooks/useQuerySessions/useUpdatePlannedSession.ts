import { useQueryClient, useMutation } from "@tanstack/react-query";

/**
 * Modifier une session planifiée
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {string|null} statusFilter - Filtre par statut ("planned" | "in-progress" | "completed" | null)
 * @returns {Object} - Mutation pour modifier une session planifiée.
 */
export function useUpdatePlannedSession(userId, statusFilter = null) {
    const queryClient = useQueryClient();
    const sessionsKey = ["sessions", userId];
    const calendarKey = ["calendar-sessions", userId, statusFilter || null];
    const dashboardKey = ["dashboard", userId];
    return useMutation({
      mutationFn: async ({ sessionId, updatedSession }) => {
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
      onMutate: async ({ sessionId, updatedSession }) => {
        await queryClient.cancelQueries({ queryKey: sessionsKey });
        await queryClient.cancelQueries({ queryKey: calendarKey });
        const previousSessions = queryClient.getQueryData(sessionsKey);
        const previousEvents = queryClient.getQueryData(calendarKey);
  
        // Mise à jour optimiste des sessions
        queryClient.setQueryData(sessionsKey, (old = []) => [
          ...old.map((s) =>
            s.id === sessionId ? { ...s, ...updatedSession } : s,
          ),
        ]);
        // Mise à jour optimiste des événements
        const start = new Date(updatedSession.scheduledDate);
        const durationMs = (updatedSession.estimatedDuration || 60) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);
        queryClient.setQueryData(calendarKey, (old = []) => [
          ...old.map((e) =>
            e.resource.id === sessionId
              ? {
                ...e,
                title: updatedSession.workoutName,
                start: start,
                end: end,
                resource: { ...e.resource, ...updatedSession },
              }
              : e,
          ),
        ]);
        return { previousSessions, previousEvents };
      },
      onError: (error, { sessionId, updatedSession }, context) => {
        queryClient.setQueryData(sessionsKey, context.previousSessions);
        queryClient.setQueryData(calendarKey, context.previousEvents);
        console.error("Erreur modification:", error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: sessionsKey });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
      },
    });
  }
  