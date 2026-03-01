"use client";

import { useQuery } from "@tanstack/react-query";
import StatCard from "./StatCard";
import NextSessionCard from "./NextSessionCard";
import TodaySessionsList from "./TodaySessionsList";
import FavoriteWorkoutCard from "./FavoriteWorkoutCard";
  import DashboardSkeleton from "./DashboardSkeleton";

export default function DashboardClient({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Erreur fetch");
      }
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });


  const {
    counts,
    totalDuration,
    streak,
    monthStats,
    totalSets,
    totalReps,
    nextSessions,
    todaySessions,
    favoriteWorkout,
    totalWeight,
  } = data?.data || {};

  // Formater la durée
  const [hours, minutes] = totalDuration?.split(":") || ["0", "0"];
  const formattedDuration = `${parseInt(hours)}h ${parseInt(minutes)}m`;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
    
          <p className="text-lg font-medium text-center" >Suivez vos progrès et planifiez vos entraînements</p>
       

      {isLoading ? ( 
        <DashboardSkeleton />
      ) : (<>
      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Séances du jour */}
        <TodaySessionsList sessions={todaySessions || []} />

        <div className="lg:col-span-2">
          {/* Prochaines séances  */}
          <NextSessionCard sessions={nextSessions || []} />
        </div>
      </div>
      {/* Stats principales (4 colonnes) */}
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {" "}
        <StatCard
          title="Streak"
          value={`${streak || 0} jour${streak > 1 ? "s" : ""}`}
          subtitle={`consécutif${streak > 1 ? "s" : ""}`}
          icon="🔥"
          trend={null}
          trendLabel={null}
        />
        <StatCard
          title={`Séance${monthStats?.completed > 1 ? "s" : ""} ce mois`}
          value={monthStats?.completed || 0}
          subtitle={`sur ${monthStats?.total || 0} planifiée${
            monthStats?.total > 1 ? "s" : ""
          }`}
          icon="📅"
          trend={monthStats?.completionRate ?? null}
          trendLabel={monthStats ? `${monthStats.completionRate}% complétées` : null}
        />{" "}
        <StatCard
          title={`Exercice${counts.exercises > 1 ? "s" : ""}`}
          value={counts.exercises}
          subtitle={`créé${counts.exercises > 1 ? "s" : ""}`}
          icon="📝"
          trend={null}
          trendLabel={null}
        />
        <StatCard
          title={`Plan${counts.workouts > 1 ? "s" : ""} d'entraînement`}
          value={counts.workouts}
          subtitle={`personnalisé${counts.workouts > 1 ? "s" : ""}`}
          icon="📋"
          trend={null}
          trendLabel={null}
        />
      </div>

      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4  gap-4">
        {" "}
        <StatCard
          title={`Séance${counts.completed > 1 ? "s" : ""} totale${
            counts.completed > 1 ? "s" : ""
          }`}
          value={counts.completed}
          subtitle={`terminée${counts.completed > 1 ? "s" : ""}`}
          icon="🏆"
          trend={null}
          trendLabel={null}
        />
        <StatCard
          title="Temps total"
          value={formattedDuration || "0h 0m"}
          subtitle="d'entraînement"
          icon="⏱️"
          trend={null}
          trendLabel={null}
        />
        <StatCard
          title="Volume total"
          value={totalWeight || 0}
          subtitle="kg"
          icon="🏋️"
          trend={null}
          trendLabel={null}
        />
        <StatCard
          title="Séries totales"
          value={totalSets || 0}
          subtitle={`${totalReps || 0} répétitions`}
          icon="💪"
          trend={null}
          trendLabel={null}
        />
      </div>
      <div className="grid grid-cols-1  md:grid-cols-5 gap-4">
        <div className="col-span-2  md:col-span-3 md:col-end-5 ">
          <FavoriteWorkoutCard workout={favoriteWorkout || null} />
        </div>
      </div>
      </>
      )}
    </div>
  );
}
