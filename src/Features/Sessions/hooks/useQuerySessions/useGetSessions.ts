import { WorkoutSession } from "@/types/workoutSession";
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { DEFAULT_SESSION_FILTERS, SessionFiltersType } from "../../utils/sessionFilters";



  
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
  
  
 