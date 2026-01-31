import { getColorByStatus } from "@/Features/Calendar/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

 
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
  