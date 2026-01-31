import { ApiErrorType } from "@/libs/apiResponse";
import { WorkoutExercise } from "@/types/workoutExercise";
import { WorkoutSession } from "@/types/workoutSession";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";


  /**
   * Créer et démarrer une nouvelle session d'entraînement (mutation React Query).
   */
  export function useStartNewSession(userId: string) {
    type UseStartNewSessionVariables = {
      workoutId: string;
      workoutName: string;
      exercises: WorkoutExercise[];
    }
  
    const queryClient = useQueryClient();
    const sessionsKey = ["sessions", userId];
    const calendarKey = ["calendar-sessions", userId];
    const dashboardKey = ["dashboard", userId];
    return useMutation<{ sessionId: string }, ApiErrorType, UseStartNewSessionVariables, { previousSessions?: WorkoutSession[] }>({
      mutationFn: async (newSession: UseStartNewSessionVariables) => {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSession),
        });
        if (!response.ok) {
          const errorData: ApiErrorType = await response.json();
          // L'API retourne { error: "string", message: "string" }
          throw new Error(
            errorData.message ||
            errorData.error ||
            "Erreur lors de la création de la séance",
          );
        }
        const data: { sessionId: string } = await response.json();
        return data;
      },
      onMutate: async (newSession: UseStartNewSessionVariables) => {
        await queryClient.cancelQueries({ queryKey: sessionsKey });
        await queryClient.cancelQueries({ queryKey: calendarKey });
        await queryClient.cancelQueries({ queryKey: dashboardKey });
        const previousSessions = queryClient.getQueryData<WorkoutSession[]>(sessionsKey);
        queryClient.setQueryData(sessionsKey, (old: WorkoutSession[] = []) => [...old, newSession]);
        return { previousSessions };
      },
      onError: (error: ApiErrorType, newSession: UseStartNewSessionVariables, context?: { previousSessions?: WorkoutSession[] }) => {
        queryClient.setQueryData(sessionsKey, context?.previousSessions || []);
      },
      onSuccess: () => {
        toast.success("L'entraînement a démarré, bon courage! 💪");
        queryClient.invalidateQueries({ queryKey: sessionsKey });
        queryClient.invalidateQueries({ queryKey: calendarKey });
        queryClient.invalidateQueries({ queryKey: dashboardKey });
      },
    });
  }