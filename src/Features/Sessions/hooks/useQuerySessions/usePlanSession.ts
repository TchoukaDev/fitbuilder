import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getColorByStatus } from "@/Features/Calendar/utils";


// Planifie une nouvelle session d'entraînement
export function usePlanSession(userId, statusFilter = null) {
    const queryClient = useQueryClient();
    const calendarKey = ["calendar-sessions", userId, statusFilter || null];
    const sessionsKey = ["sessions", userId];
    const dashboardKey = ["dashboard", userId];
  
    return useMutation({
      mutationFn: async (newSession) => {
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
  
      onMutate: async (newSession) => {
        await queryClient.cancelQueries({ queryKey: sessionsKey });
        await queryClient.cancelQueries({ queryKey: calendarKey });
        await queryClient.cancelQueries({ queryKey: dashboardKey });
        const previousEvents = queryClient.getQueryData(calendarKey);
        const previousSessions = queryClient.getQueryData(sessionsKey);
  
        // ✅ Transformer en événement calendrier (UNIQUEMENT pour ce hook)
        const scheduledDate = new Date(newSession.scheduledDate);
        const durationMs = (newSession.estimatedDuration || 60) * 60 * 1000; // ✅ Conversion
        const tempEvent = {
          id: `temp-${Date.now()}`,
          title: newSession.workoutName,
          start: scheduledDate,
          end: new Date(scheduledDate.getTime() + durationMs),
          resource: {
            ...newSession,
            status: "planned",
            _id: `temp-${Date.now()}`,
          },
          color: getColorByStatus("planned").color,
          colorHover: getColorByStatus("planned").colorHover,
        };
        // Mise à jour optimiste des événements avec tempEvent
        queryClient.setQueryData(calendarKey, (old = []) => [...old, tempEvent]);
  
        // Mise à jour optimiste des sessions avec newSession
        queryClient.setQueryData(sessionsKey, (old = []) => [...old, newSession]);
  
        return { previousEvents, previousSessions };
      },
  
      onError: (error, newSession, context) => {
        queryClient.setQueryData(calendarKey, context.previousEvents);
        queryClient.setQueryData(sessionsKey, context.previousSessions);
        console.error("Erreur planification:", error);
      },
  
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: sessionsKey });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
        toast.success("Séance planifiée avec succès");
      },
    });
  }