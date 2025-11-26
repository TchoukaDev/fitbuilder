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
  const [templateFilter, setTemplateFilter] = useState(
    searchParams.get("templateFilter") || "all",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  // Synchronisation avec l'URL (navigation navigateur)
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    const urlDateFilter = searchParams.get("dateFilter") || "all";
    const urlTemplateFilter = searchParams.get("templateFilter") || "all";
    const urlPage = parseInt(searchParams.get("page")) || 1;

    if (
      urlStatus !== statusFilter ||
      urlDateFilter !== dateFilter ||
      urlTemplateFilter !== templateFilter ||
      urlPage !== page
    ) {
      setStatusFilter(urlStatus);
      setDateFilter(urlDateFilter);
      setTemplateFilter(urlTemplateFilter);
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
    if (newFilters.templateFilter && newFilters.templateFilter !== "all") {
      params.set("templateFilter", newFilters.templateFilter);
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
      templateFilter,
      page: 1,
    });
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter: newDateFilter,
      templateFilter,
      page: 1,
    });
  };

  const handleTemplateFilterChange = (newTemplateFilter) => {
    setTemplateFilter(newTemplateFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter,
      templateFilter: newTemplateFilter,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURL({
      status: statusFilter,
      dateFilter,
      templateFilter,
      page: newPage,
    });
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setTemplateFilter("all");
    setPage(1);
    router.push("/sessions");
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  return {
    // État
    statusFilter,
    dateFilter,
    templateFilter,
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
    handleTemplateFilterChange,
    handlePageChange,
    handleResetFilters,
  };
}

