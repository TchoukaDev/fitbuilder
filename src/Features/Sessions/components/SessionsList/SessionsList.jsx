"use client";

// Liste des séances avec filtres (statut, date, workout), pagination et stats.
import { Calendar } from "lucide-react";
import { useSessionsList } from "../../hooks";
import {
  SessionCard,
  SessionsFilters,
  SessionsPagination,
  SessionsStats,
} from ".";

export default function SessionsList({
  initialSessions,
  userId,
  initialFilters,
}) {
  const {
    statusFilter,
    dateFilter,
    workoutFilter,
    sessions,
    pagination,
    stats,
    isLoading,
    isFetching,
    handleStatusChange,
    handleDateFilterChange,
    handleWorkoutFilterChange,
    handlePageChange,
    handleResetFilters,
  } = useSessionsList(initialSessions, userId, initialFilters);

  // État de chargement
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

  // Aucune séance
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
      <SessionsStats stats={stats} />

      {/* FILTRES */}
      <SessionsFilters
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        workoutFilter={workoutFilter}
        onStatusChange={handleStatusChange}
        onDateFilterChange={handleDateFilterChange}
        onWorkoutFilterChange={handleWorkoutFilterChange}
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
              <SessionCard
                key={session._id}
                session={session}
                userId={userId}
              />
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
