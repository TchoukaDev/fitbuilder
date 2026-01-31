
import { ApiErrorType } from "@/libs/apiResponse";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * Annuler une session planifiée
 */
export function useCancelPlannedSession(userId: string) {
  const queryClient = useQueryClient();
  const sessionsKey = ["sessions", userId];
  const dashboardKey = ["dashboard", userId];
  const calendarKey = ["calendar-sessions", userId];
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      toast.success("Séance annulée avec succès");
    },
    onError: (error: ApiErrorType) => {
      toast.error(error.message || error.error || "Erreur lors de l'annulation de la séance");
    },
  });
}

