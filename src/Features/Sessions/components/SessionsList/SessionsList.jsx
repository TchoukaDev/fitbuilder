// components/Features/Sessions/SessionsList/SessionsList.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetSessions } from "@/Features/Sessions/hooks/useSessions";
import SessionCard from "../SessionCard/SessionCard";
import SessionStats from "./SessionStats/SessionsStats";
import SessionFilters from "./SessionsFilters/SessionsFilters";
import SessionsPagination from "./SessionsPagination/SessionsPagination";
import { Calendar } from "lucide-react";

export default function SessionsList({
  initialSessions,
  userId,
  initialFilters,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ═══════════════════════════════════════════════════════
  // 📊 STATE
  // ═══════════════════════════════════════════════════════
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

  // ✅ Sync avec URL (bouton back navigateur)
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    const urlDateFilter = searchParams.get("dateFilter") || "all";
    const urlTemplateFilter = searchParams.get("templateFilter" || "all");
    const urlPage = parseInt(searchParams.get("page")) || 1;

    if (
      urlStatus !== statusFilter ||
      urlDateFilter !== dateFilter ||
      urlTemplateFilter !== templateFilter ||
      urlPage !== page
    ) {
      setStatusFilter(urlStatus);
      setDateFilter(urlDateFilter);
      setPage(urlPage);
    }
  }, [searchParams]);

  // ═══════════════════════════════════════════════════════
  // 🔄 REACT QUERY
  // ═══════════════════════════════════════════════════════
  const { data, isLoading, isFetching } = useGetSessions(
    initialSessions,
    userId,

    initialFilters,
  );

  const sessions = data?.sessions || [];
  const pagination = data?.pagination || {};
  const stats = data?.stats || {};

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════
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

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    updateURL({
      status: newStatus,
      dateFilter,
      templateFilter: templateFilter,
      page: 1,
    });
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter: newDateFilter,
      templateFilter: templateFilter,
      page: 1,
    });
  };

  const handleTemplateFilterChange = (newTemplateFilter) => {
    setTemplateFilter(newTemplateFilter);
    setPage(1);
    updateURL({
      status: statusFilter,
      dateFilter: dateFilter,
      templateFilter: newTemplateFilter,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURL({
      status: statusFilter,
      dateFilter,
      templateFilter: templateFilter,
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

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER - LOADING
  // ═══════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER - VIDE
  // ═══════════════════════════════════════════════════════
  if (stats.total === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-900 mb-6">
          📜 Historique des séances
        </h1>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Aucune séance trouvée</p>
          <p className="text-gray-400 text-sm">
            Commence une séance depuis un modèle d'entraînement pour la voir
            apparaître ici !
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER - NORMAL
  // ═══════════════════════════════════════════════════════
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          📈 Suivi des séances
        </h1>
        <p className="text-gray-600">
          {stats.total} séance{stats.total > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* STATS */}
      <SessionStats stats={stats} />

      {/* FILTRES */}
      <SessionFilters
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        templateFilter={templateFilter}
        onStatusChange={handleStatusChange}
        onDateFilterChange={handleDateFilterChange}
        onTemplateFilterChange={handleTemplateFilterChange}
        sessions={initialSessions.sessions}
        isFetching={isFetching}
      />

      {/* INDICATEUR DE CHARGEMENT */}
      {isFetching && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg text-center">
          <p className="text-sm text-primary-700">Chargement des séances...</p>
        </div>
      )}

      {/* LISTE DES SÉANCES */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            Aucune séance trouvée avec ces filtres
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {sessions.map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </div>

          {/* PAGINATION */}
          <SessionsPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalSessions}
            onPageChange={handlePageChange}
            isFetching={isFetching}
          />
        </>
      )}
    </div>
  );
}
