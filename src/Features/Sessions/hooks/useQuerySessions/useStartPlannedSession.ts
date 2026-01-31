import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";


/**
 * Démarrer une session planifiée
 */

export function useStartPlannedSession(userId: string) {
    const queryClient = useQueryClient();
    const sessionsKey = ["sessions", userId];
    const calendarKey = ["calendar-sessions", userId];
    const dashboardKey = ["dashboard", userId];
    return useMutation({
      mutationFn: async (sessionId) => {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        });
  
        if (!res.ok) throw new Error("Erreur démarrage");
        return res.json();
      },
  
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: sessionsKey });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
        toast.success("Séance démarrée !");
      },
    });
  }
  