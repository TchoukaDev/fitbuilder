"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetSessions } from "@/hooks/useSessions";
import SessionCard from "../SessionCard/SessionCard";
import { Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function SessionsList({ initialSessions, userId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Sync state avec URL si changement externe (ex: bouton back)
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    const urlDateFilter = searchParams.get("dateFilter") || "all";
    const urlPage = parseInt(searchParams.get("page")) || 1;

    if (
      urlStatus !== statusFilter ||
      urlDateFilter !== dateFilter ||
      urlPage !== page
    ) {
      setStatusFilter(urlStatus);
      setDateFilter(urlDateFilter);
      setPage(urlPage);
    }
  }, [searchParams]);

  // ═══════════════════════════════════════════════════════
  // 📊 STATE - Récupérer depuis URL ou défaut
  // ═══════════════════════════════════════════════════════
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );
  const [dateFilter, setDateFilter] = useState(
    searchParams.get("dateFilter") || "all",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  // ═══════════════════════════════════════════════════════
  // 🔄 REACT QUERY
  // ═══════════════════════════════════════════════════════
  const { data, isLoading, isFetching } = useGetSessions(
    initialSessions,
    userId,
    {
      status: statusFilter,
      dateFilter: dateFilter,
      page: page,
      limit: 1,
    },
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
    setPage(1); // ✅ Reset page à 1
    updateURL({
      status: newStatus,
      dateFilter,
      page: 1,
    });
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setPage(1); // ✅ Reset page à 1
    updateURL({
      status: statusFilter,
      dateFilter: newDateFilter,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURL({
      status: statusFilter,
      dateFilter,
      page: newPage,
    });

    // ✅ Scroll vers le haut
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
  // 🎨 RENDER - VIDE (aucune session dans toute la DB)
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
      {/* ─────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          📜 Historique des séances
        </h1>
        <p className="text-gray-600">
          {stats.total} séance{stats.total > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* STATS GLOBALES */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-700 font-medium">Total</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-green-700 font-medium">
            Terminées
          </p>
          <p className="text-xl md:text-2xl font-bold text-green-900">
            {stats.completed}
          </p>
        </div>
        <div className="bg-primary-100 border border-primary-300 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-primary-700 font-medium">
            En cours
          </p>
          <p className="text-xl md:text-2xl font-bold text-primary-900">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-accent-100 border border-accent-300 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-accent-700 font-medium">
            Planifiées
          </p>
          <p className="text-xl md:text-2xl font-bold text-accent-900">
            {stats.planned}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* FILTRE PAR PÉRIODE */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par période
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleDateFilterChange("all")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              dateFilter === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Toutes
          </button>
          <button
            onClick={() => handleDateFilterChange("week")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              dateFilter === "week"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            7 derniers jours
          </button>
          <button
            onClick={() => handleDateFilterChange("month")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              dateFilter === "month"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            30 derniers jours
          </button>
          <button
            onClick={() => handleDateFilterChange("quarter")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              dateFilter === "quarter"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            3 derniers mois
          </button>
          <button
            onClick={() => handleDateFilterChange("year")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              dateFilter === "year"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Dernière année
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* FILTRE PAR STATUT */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par statut
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleStatusChange("all")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Toutes
          </button>
          <button
            onClick={() => handleStatusChange("completed")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              statusFilter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Terminées
          </button>
          <button
            onClick={() => handleStatusChange("in-progress")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              statusFilter === "in-progress"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            En cours
          </button>
          <button
            onClick={() => handleStatusChange("planned")}
            disabled={isFetching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              statusFilter === "planned"
                ? "bg-accent-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Planifiées
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* INDICATEUR DE CHARGEMENT */}
      {/* ─────────────────────────────────────────────────── */}
      {isFetching && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg text-center">
          <p className="text-sm text-primary-700">Chargement des séances...</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────── */}
      {/* LISTE DES SÉANCES */}
      {/* ─────────────────────────────────────────────────── */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            Aucune séance trouvée avec ces filtres
          </p>
          <button
            onClick={() => {
              setStatusFilter("all");
              setDateFilter("all");
              setPage(1);
              updateURL({ status: "all", dateFilter: "all", page: 1 });
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
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

          {/* ─────────────────────────────────────────────── */}
          {/* PAGINATION */}
          {/* ─────────────────────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              {/* Info pagination */}
              <div className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.totalPages} •{" "}
                {pagination.totalSessions} séance
                {pagination.totalSessions > 1 ? "s" : ""}
              </div>

              {/* Boutons de navigation */}
              <div className="flex items-center gap-2">
                {/* Bouton Précédent */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPreviousPage || isFetching}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                    pagination.hasPreviousPage && !isFetching
                      ? "bg-primary-600 text-white hover:bg-primary-700 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft size={18} />
                  Précédent
                </button>

                {/* Numéros de pages */}
                <div className="flex gap-1">
                  {renderPageNumbers(pagination.page, pagination.totalPages)}
                </div>

                {/* Bouton Suivant */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNextPage || isFetching}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                    pagination.hasNextPage && !isFetching
                      ? "bg-primary-600 text-white hover:bg-primary-700 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Suivant
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // 🎨 HELPER - Rendu des numéros de pages
  // ═══════════════════════════════════════════════════════
  function renderPageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxVisible = 5; // Nombre max de pages visibles

    // Si peu de pages, afficher toutes
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            disabled={isFetching}
            className={`w-10 h-10 rounded-lg font-medium transition ${
              currentPage === i
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } ${
              isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {i}
          </button>,
        );
      }
      return pages;
    }

    // Logique pour beaucoup de pages
    // Toujours afficher la première page
    pages.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        disabled={isFetching}
        className={`w-10 h-10 rounded-lg font-medium transition ${
          currentPage === 1
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } ${isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        1
      </button>,
    );

    // Ellipse gauche si nécessaire
    if (currentPage > 3) {
      pages.push(
        <span
          key="ellipsis-left"
          className="w-10 h-10 flex items-center justify-center text-gray-400"
        >
          ...
        </span>,
      );
    }

    // Pages autour de la page courante
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={isFetching}
          className={`w-10 h-10 rounded-lg font-medium transition ${
            currentPage === i
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } ${isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {i}
        </button>,
      );
    }

    // Ellipse droite si nécessaire
    if (currentPage < totalPages - 2) {
      pages.push(
        <span
          key="ellipsis-right"
          className="w-10 h-10 flex items-center justify-center text-gray-400"
        >
          ...
        </span>,
      );
    }

    // Toujours afficher la dernière page
    pages.push(
      <button
        key={totalPages}
        onClick={() => handlePageChange(totalPages)}
        disabled={isFetching}
        className={`w-10 h-10 rounded-lg font-medium transition ${
          currentPage === totalPages
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } ${isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {totalPages}
      </button>,
    );

    return pages;
  }
}
