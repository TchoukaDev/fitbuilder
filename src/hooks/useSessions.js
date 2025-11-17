import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

// ═══════════════════════════════════════════════════════
// 🔍 GET SESSIONS (avec filtres server-side)
// ═══════════════════════════════════════════════════════
export function useGetSessions(initialData, userId, filters = {}) {
  const { status = "all", dateFilter = "all", page = 1, limit = 20 } = filters;

  // ✅ Tous les filtres dans la queryKey pour cache séparé
  const key = ["sessions", userId, { status, dateFilter, page, limit }];

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
    initialData: initialData,
    placeholderData: keepPreviousData, // ✅ Garde les données pendant le fetch
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!userId,
  });
}

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
        throw new Error(errorData.error);
      }
      const data = await response.json();
      return data;
    },

    onSuccess: (data) => {
      toast.success("L'entraînement a démarré, bon courage! 💪");
      const sessionId = data.sessionId;
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
}
