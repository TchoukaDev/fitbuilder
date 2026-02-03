import { getColorByStatus } from "@/Features/Calendar/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarEvent } from "@/types/calendarEvent";
import { WorkoutSession } from "@/types/workoutSession";

 
  /**
   * Hook pour récupérer les sessions du calendrier
   */
  export function useGetCalendarSessions(
    initialEvents: CalendarEvent[],
    userId: string,
    statusFilter: string[] | null,
  ) {
    const calendarKey = ["calendar-sessions", userId]; 
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
        return data.sessions.map((session: WorkoutSession) => {
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
  