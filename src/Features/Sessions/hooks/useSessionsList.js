// Hook pour gérer l'état et la logique de la liste des séances
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetSessions } from "./useSessions";

export function useSessionsList(initialSessions, userId, initialFilters) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États des filtres
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );
  const [dateFilter, setDateFilter] = useState(
    searchParams.get("dateFilter") || "all",
  );
  const [workoutFilter, setWorkoutFilter] = useState(
    searchParams.get("workoutFilter") || "all",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  // Synchronisation avec l'URL (navigation navigateur)
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    const urlDateFilter = searchParams.get("dateFilter") || "all";
    const urlWorkoutFilter = searchParams.get("workoutFilter") || "all";
    const urlPage = parseInt(searchParams.get("page")) || 1;

    if (
      urlStatus !== statusFilter ||
      urlDateFilter !== dateFilter ||
      urlWorkoutFilter !== workoutFilter ||
      urlPage !== page
    ) {
      setStatusFilter(urlStatus);
      setDateFilter(urlDateFilter);
      setWorkoutFilter(urlWorkoutFilter);
      setPage(urlPage);
    }
  }, [searchParams]);

  // Récupération des données
  const { data, isLoading, isFetching } = useGetSessions(
    initialSessions,
    userId,
    initialFilters,
  );

  const sessions = data?.sessions || [];
  const pagination = data?.pagination || {};
  const stats = data?.stats || {};

  // Mise à jour de l'URL
  const updateURL = (newFilters) => {
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
      params.set("page", newFilters.page);
    }

    const newURL = params.toString()
      ? `/sessions?${params.toString()}`
      : "/sessions";

    router.push(newURL, { scroll: false });
  };

  // Gestion des changements de filtres
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    updateURL({
      status: newStatus,
      dateFilter,
      workoutFilter,
      page: 1,
    });
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter: newDateFilter,
      workoutFilter,
      page: 1,
    });
  };

  const handleWorkoutFilterChange = (newWorkoutFilter) => {
    setWorkoutFilter(newWorkoutFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter,
      workoutFilter: newWorkoutFilter,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURL({
      status: statusFilter,
      dateFilter,
      workoutFilter,
      page: newPage,
    });
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setWorkoutFilter("all");
    setPage(1);
    router.push("/sessions");
    window.scrollTo({ top: 150, behavior: "smooth" });
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
