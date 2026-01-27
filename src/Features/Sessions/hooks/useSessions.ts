import { getColorByStatus } from "@/Features/Calendar/utils/getColorByStatus";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ApiErrorType, ApiSuccessType } from "@/libs/apiResponse";
import { WorkoutSession } from "@/types/workoutSession";
import { WorkoutExercise } from "@/types/workoutExercise";



export const DEFAULT_SESSION_FILTERS = {
  status: "all",
  dateFilter: "all",
  workoutFilter: "all",
  page: 1,
  limit: 10,
} as const;

export interface SessionFiltersType {
  status: string | typeof DEFAULT_SESSION_FILTERS.status;
  dateFilter: string | typeof DEFAULT_SESSION_FILTERS.dateFilter;
  workoutFilter: string | typeof DEFAULT_SESSION_FILTERS.workoutFilter;
  page: number | typeof DEFAULT_SESSION_FILTERS.page;
  limit: number | typeof DEFAULT_SESSION_FILTERS.limit;
}

/**
 * Récupère la liste paginée de sessions avec filtres côté serveur.

 */
interface UseGetSessionsProps {
  initialData?: SessionsResponse;
  userId: string;
  filters?: SessionFiltersType;
}

export interface SessionsResponse {
  sessions: WorkoutSession[];
  pagination: {
    page: number | 0;
    limit: number | 0;
    totalSessions: number | 0;
    totalPages: number | 0;
    hasNextPage: boolean | false;
    hasPreviousPage: boolean | false;
  };
  stats: {
    total: number | 0;
    completed: number | 0;
    inProgress: number | 0;
    planned: number | 0;
  };
}

export function useGetSessions({
  initialData,
  userId,
  filters = DEFAULT_SESSION_FILTERS
}: UseGetSessionsProps) {

  const {
    status,
    dateFilter,
    workoutFilter,
    page,
    limit,
  } = { ...DEFAULT_SESSION_FILTERS, ...filters };

  const key = [
    "sessions",
    userId,
    { status, dateFilter, workoutFilter, page, limit },
  ];

  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<SessionsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status && status !== "all") {
        params.append("status", status);
      }

      if (dateFilter && dateFilter !== "all") {
        params.append("dateFilter", dateFilter);
      }

      if (workoutFilter && workoutFilter !== "all") {
        params.append("workoutFilter", workoutFilter);
      }

      const response = await fetch(`/api/sessions?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erreur fetch sessions");
      }

      const data: SessionsResponse = await response.json();

      return data;
    },
    initialData: status === "all" && dateFilter === "all" && workoutFilter === "all" && page === 1
      ? initialData
      : undefined,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!userId,
  });
}



/**
 * Hook pour récupérer les sessions du calendrier
 * @param {string} userId - ID de l'utilisateur
 * @param {string|null} statusFilter - Filtre par statut ("planned" | "in-progress" | "completed" | null)
 */
export function useGetCalendarSessions(
  initialEvents,
  userId,
  statusFilter = null,
) {
  const calendarKey = ["calendar-sessions", userId, statusFilter || null]; // ✅ Cache différent par statut
  return useQuery({
    queryKey: calendarKey,
    queryFn: async () => {
      // Construire l'URL avec le filtre si fourni
      const url = statusFilter
        ? `/api/calendar?status=${statusFilter}`
        : "/api/calendar";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur fetch sessions calendrier");
      const data = await response.json();

      // Transformer en événements calendrier
      return data.sessions.map((session) => {
        const start = new Date(session.scheduledDate);
        const durationMs = (session.estimatedDuration || 60) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);

        return {
          id: session.id,
          title: session.workoutName,
          start: start,
          end: end,
          resource: session,
          color: getColorByStatus(session.status).color,
          colorHover: getColorByStatus(session.status).colorHover,
        };
      });
    },
    initialData: initialEvents,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!userId,
  });
}

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
    onError: (error, newSession, context) => {
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

export function useFinishSession(userId, sessionId) {
  const queryClient = useQueryClient();
  const sessionsKey = ["sessions", userId];
  const calendarKey = ["calendar-sessions", userId];
  const dashboardKey = ["dashboard", userId];
  return useMutation({
    mutationFn: async ({ exercises, duration }) => {
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
      queryClient.setQueryData(sessionsKey, (old = []) => [
        old.map((s) =>
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
      queryClient.setQueryData(sessionsKey, context.previousSessions);
      queryClient.setQueryData(calendarKey, context.previousEvents);
      console.error("Erreur finalisation:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}

/**
 * Annuler une session planifiée
 * @param {string} userId - Identifiant de l'utilisateur.
 * @returns {Object} - Mutation pour annuler une session planifiée.
 */
export function useCancelPlannedSession(userId) {
  const queryClient = useQueryClient();
  const sessionsKey = ["sessions", userId];
  const dashboardKey = ["dashboard", userId];
  const calendarKey = ["calendar-sessions", userId];
  return useMutation({
    mutationFn: async (sessionId) => {
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
    onError: (error) => {
      toast.error("Erreur lors de l'annulation de la séance");
    },
  });
}

/**
 * Supprimer une session d'entraînement (mutation React Query).
 */

type UseDeleteSessionProps = {
  userId: string;
  statusFilter: string | null;
}

export function useDeleteSession({ userId, statusFilter = null }: UseDeleteSessionProps) {
  const queryClient = useQueryClient();
  const sessionsKey = ["sessions", userId];
  const calendarKey = ["calendar-sessions", userId, statusFilter || null];
  const dashboardKey = ["dashboard", userId];
  return useMutation({

    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData: ApiErrorType = await response.json();
        throw new Error(errorData.message || errorData.error || "Erreur suppression de la session d'entraînement");
      }
      const data: ApiSuccessType = await response.json();
      return data;
    },
    onMutate: async (id) => {
      queryClient.cancelQueries({ queryKey: sessionsKey });
      queryClient.cancelQueries({ queryKey: calendarKey });
      const previousSessions = queryClient.getQueryData<WorkoutSession[]>(sessionsKey);
      const previousEvents = queryClient.getQueryData(calendarKey);

      // Mise à jour optimiste des sessions
      queryClient.setQueryData<WorkoutSession[]>(sessionsKey, (old = []) =>
        old.filter((s) => s.id !== id),
      );
      // Mise à jour optimiste des événements
      queryClient.setQueryData(calendarKey, (old = []) =>
        old.filter((e) => e.resource.id !== id),
      );
      return { previousSessions, previousEvents };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(sessionsKey, context?.previousSessions);
      queryClient.setQueryData(calendarKey, context?.previousEvents);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      queryClient.invalidateQueries({ queryKey: calendarKey });
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
