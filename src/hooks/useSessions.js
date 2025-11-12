import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useGetSessions(initialData, userId) {
  const key = ["sessions", userId];
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await fetch("/api/sessions");
      if (!response.ok) {
        throw new Error("Erreur fetch sessions");
      }
      const data = await response.json();
      return data;
    },
    initialData: initialData,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
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

    //   Rendu optimiste non nécessaire car redirection sur la page de la session
    // onMutate: async (newSession) => {
    //   await queryClient.cancelQueries({ queryKey: key });

    //   const previousSessions = queryClient.getQueryData(key);

    //   queryClient.setQueryData(key, (old) => {
    //     return [
    //       ...(old || []),
    //       {
    //         ...newSession,
    //         _id: `temp-${Date.now}`,
    //         createdAt: new Date(),
    //       },
    //     ];
    //   });
    //   return { previousSessions };
    // },
    // onError: (error, newSession, context) => {
    //   queryClient.setQueryData(key, context.previousSessions);
    // },
    onSuccess: (data) => {
      toast.success("L'entraînement a démarré, bon courage! 💪");
      const sessionId = data.sessionId;
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
}

export function useGetSessionById(initialData, sessionId) {
  const key = ["session", sessionId];
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    },
    initialData: initialData,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false, // ✅ Ne pas refetch au focus
    enabled: !!sessionId,
  });
}
