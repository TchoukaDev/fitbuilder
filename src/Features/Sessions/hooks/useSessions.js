import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
/**
 * Récupère la liste paginée de sessions avec filtres côté serveur.
 *
 * @param {any} initialData - Données initiales pour hydrater le cache.
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {Object} [filters] - Filtres (status, dateFilter, workoutFilter, page, limit).
 */
export function useGetSessions(initialData, userId, filters = {}) {
  const {
    status = "all",
    dateFilter = "all",
    workoutFilter = "all",
    page = 1,
    limit = 20,
  } = filters;

  // ✅ Tous les filtres dans la queryKey pour cache séparé
  const key = [
    "sessions",
    userId,
    { status, dateFilter, workoutFilter, page, limit },
  ];

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      // ✅ Construction des query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // ✅ Ajouter status si différent de "all"
      if (status && status !== "all") {
        params.append("status", status);
      }

      // ✅ Ajouter dateFilter si différent de "all"
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

      const data = await response.json();

      // ✅ Retourner TOUT (sessions, pagination, stats)
      return {
        sessions: data.sessions || [],
        pagination: data.pagination || {},
        stats: data.stats || {},
      };
    },
    initialData:
      status === "all" &&
      dateFilter === "all" &&
      workoutFilter === "all" &&
      page === 1 &&
      limit === 20
        ? initialData
        : undefined,
    placeholderData: keepPreviousData, // ✅ Garde les données pendant le fetch
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!userId,
  });
}

/**
 * Hook pour récupérer les sessions du calendrier
 * @param {string} userId - ID de l'utilisateur
 * @param {string|null} statusFilter - Filtre par statut ("planned" | "in-progress" | "completed" | "skipped" | null)
 */
export function useGetCalendarSessions(userId, statusFilter = null) {
  return useQuery({
    queryKey: ["calendar-sessions", userId, statusFilter], // ✅ Cache différent par statut
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
          id: session._id,
          title: session.workoutName,
          start: start,
          end: end,
          resource: session,
          color: getColorByStatus(session.status).color,
          colorHover: getColorByStatus(session.status).colorHover,
        };
      });
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
// Retourne la couleur en fonction du statut
function getColorByStatus(status) {
  const colors = {
    planned: "#5c31e0", // 🔵primary-400
    "in-progress": "#ffaa66", // 🟠 accent-400
    completed: "oklch(79.2% 0.209 151.711)", // 🟢 green-400
  };

  const colorHover = {
    planned: "#260d87", // 🔵primary-500
    "in-progress": "#ff6600", // 🟠 accent-500
    completed: "oklch(72.3% 0.219 149.579)", // 🟢 green-500
  };
  return {
    color: colors[status] || colors.planned,
    colorHover: colorHover[status] || colorHover.planned,
  };
}

// Démarrer une session planifiée
export function useStartPlannedSession(userId) {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["sessions", userId] });
      toast.success("Séance démarrée !");
    },
  });
}

/**
 * Créer et démarrer une nouvelle session d'entraînement (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useStartNewSession(userId) {
  const queryClient = useQueryClient();
  const key = ["sessions", userId];
  return useMutation({
    mutationFn: async (newSession) => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Erreur lors de la création de la séance",
        );
      }
      const data = await response.json();
      return data;
    },
    onMutate: async (newSession) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previousSessions = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) => [...old, newSession]);
      return { previousSessions };
    },
    onError: (error, newSession, context) => {
      queryClient.setQueryData(key, context.previousSessions);
    },
    onSuccess: () => {
      toast.success("L'entraînement a démarré, bon courage! 💪");
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

// Planifie une nouvelle session d'entraînement
export function usePlanSession(userId) {
  const queryClient = useQueryClient();
  const key = ["calendar-sessions", userId];
  const key2 = ["sessions", userId];

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
      await queryClient.cancelQueries({ queryKey: key });

      const previousSessions = queryClient.getQueryData(key);

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
        color: "7557ff",
        colorHover: "5c31e0",
      };

      queryClient.setQueryData(key, (old = []) => [...old, tempEvent]);

      return { previousSessions };
    },

    onError: (error, newSession, context) => {
      queryClient.setQueryData(key, context.previousSessions);
      console.error("Erreur planification:", error);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: key2 });
      toast.success("Séance planifiée avec succès");
    },
  });
}

// Annuler une session planifiée
export function useCancelPlannedSession(userId) {
  const queryClient = useQueryClient();
  const key = ["sessions", userId];
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
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("Séance annulée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'annulation de la séance");
    },
  });
}

/**
 * Supprimer une session d'entraînement (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useDeleteSession(userId) {
  const queryClient = useQueryClient();
  const key = ["sessions", userId];
  return useMutation({
    queryKey: key,
    mutationFn: async (sessionId) => {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Erreur suppression de la session d'entraînement",
        );
      }
      const data = response.json();
      return data;
    },
    onMutate: async (id) => {
      queryClient.cancelQueries({ queryKey: key });
      const previousSessions = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) =>
        old.filter((s) => s._id !== id),
      );

      return { previousSessions };
    },
    onError: (error) => {
      queryClient.setQueryData(key, context?.previousSessions);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
