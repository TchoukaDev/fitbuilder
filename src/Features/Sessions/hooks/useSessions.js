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
 * @param {Object} [filters] - Filtres (status, dateFilter, templateFilter, page, limit).
 */
export function useGetSessions(initialData, userId, filters = {}) {
  const {
    status = "all",
    dateFilter = "all",
    templateFilter = "all",
    page = 1,
    limit = 20,
  } = filters;

  // ✅ Tous les filtres dans la queryKey pour cache séparé
  const key = [
    "sessions",
    userId,
    { status, dateFilter, templateFilter, page, limit },
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

      if (templateFilter && templateFilter !== "all") {
        params.append("templateFilter", templateFilter);
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
      templateFilter === "all" &&
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
 * Crée une nouvelle session d'entraînement (mutation React Query).
 *
 * @param {string} userId - Identifiant de l'utilisateur.
 */
export function useCreateSession(userId) {
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
          errorData.message || errorData.error || "Erreur inconnue",
        );
      }
      const data = await response.json();
      return data;
    },

    onSuccess: () => {
      toast.success("L'entraînement a démarré, bon courage! 💪");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du démarrage de la séance");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

/**
 * Supprime une session d'entraînement (mutation React Query).
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

    onSuccess: () => {
      toast.success("Session d'entraînement supprimée avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'annulation de la session");
      queryClient.setQueryData(key, context?.previousSessions);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
