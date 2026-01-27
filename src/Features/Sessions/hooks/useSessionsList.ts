// Hook pour gérer l'état et la logique de la liste des séances
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_SESSION_FILTERS, useGetSessions } from "./useSessions";
import { SessionFiltersType } from "./useSessions";
import { SessionsResponse } from "./useSessions";

interface UseSessionsListProps {
  initialData: SessionsResponse;
  userId: string;
  initialFilters: SessionFiltersType;
}
export function useSessionsList({ initialData, userId, initialFilters }: UseSessionsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États des filtres
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || initialFilters.status || DEFAULT_SESSION_FILTERS.status,
  );
  const [dateFilter, setDateFilter] = useState(
    searchParams.get("dateFilter") || initialFilters.dateFilter || DEFAULT_SESSION_FILTERS.dateFilter,
  );
  const [workoutFilter, setWorkoutFilter] = useState(
    searchParams.get("workoutFilter") || initialFilters.workoutFilter || DEFAULT_SESSION_FILTERS.workoutFilter,
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || DEFAULT_SESSION_FILTERS.page.toString()) || initialFilters.page
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || DEFAULT_SESSION_FILTERS.limit.toString()) || initialFilters.limit
  );


  // Synchronisation avec l'URL (navigation navigateur)
  useEffect(() => {
    const urlStatus = searchParams.get("status") || DEFAULT_SESSION_FILTERS.status;
    const urlDateFilter = searchParams.get("dateFilter") || DEFAULT_SESSION_FILTERS.dateFilter;
    const urlWorkoutFilter = searchParams.get("workoutFilter") || DEFAULT_SESSION_FILTERS.workoutFilter;
    const urlPage = parseInt(searchParams.get("page") || DEFAULT_SESSION_FILTERS.page.toString())
    const urlLimit = parseInt(searchParams.get("limit") || DEFAULT_SESSION_FILTERS.limit.toString())
    if (
      urlStatus !== statusFilter ||
      urlDateFilter !== dateFilter ||
      urlWorkoutFilter !== workoutFilter ||
      urlPage !== page ||
      urlLimit !== limit
    ) {
      setStatusFilter(urlStatus);
      setDateFilter(urlDateFilter);
      setWorkoutFilter(urlWorkoutFilter);
      setPage(urlPage);
      setLimit(urlLimit);
    }
  }, [searchParams]);

  // Récupération des données
  const { data, isLoading, isFetching } = useGetSessions(
    {
      initialData, userId, filters: {
        status: statusFilter,
        dateFilter: dateFilter,
        workoutFilter: workoutFilter,
        page: page,
        limit: limit,
      }
    },
  );

  const sessions = data?.sessions || [];
  const pagination = data?.pagination || {
    page: 0,
    limit: 0,
    totalSessions: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const stats = data?.stats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    planned: 0,
  };

  // Mise à jour de l'URL
  const updateURL = (newFilters: SessionFiltersType) => {
    const params = new URLSearchParams();

    if (newFilters.status && newFilters.status !== "all") {
      params.set("status", newFilters.status);
    }
    if (newFilters.dateFilter && newFilters.dateFilter !== "all") {
      params.set("dateFilter", newFilters.dateFilter);
    }
    if (newFilters.workoutFilter && newFilters.workoutFilter !== "all") {
      params.set("workoutFilter", newFilters.workoutFilter);
    }
    if (newFilters.page && newFilters.page !== 1) {
      params.set("page", newFilters.page.toString());
    }

    const newURL = params.toString()
      ? `/sessions?${params.toString()}`
      : "/sessions";

    router.push(newURL, { scroll: false });
  };

  // Gestion des changements de filtres
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    updateURL({
      status: newStatus,
      dateFilter,
      workoutFilter,
      page: 1,
      limit: limit,
    });
  };

  const handleDateFilterChange = (newDateFilter: string) => {
    setDateFilter(newDateFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter: newDateFilter,
      workoutFilter,
      page: 1,
      limit: limit,
    });
  };

  const handleWorkoutFilterChange = (newWorkoutFilter: string) => {
    setWorkoutFilter(newWorkoutFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter,
      workoutFilter: newWorkoutFilter,
      page: 1,
      limit: limit,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({
      status: statusFilter,
      dateFilter,
      workoutFilter,
      page: newPage,
      limit: limit,
    });
  };



  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setWorkoutFilter("all");
    setPage(1);
    router.push("/sessions");
  };

  return {
    // État
    statusFilter,
    dateFilter,
    workoutFilter,
    page,

    // Données
    sessions,
    pagination,
    stats,
    isLoading,
    isFetching,
    // Handlers
    handleStatusChange,
    handleDateFilterChange,
    handleWorkoutFilterChange,
    handlePageChange,

    handleResetFilters,
  };
}
