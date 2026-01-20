"use client";

// Composant parent pour la liste des exercices avec filtres et onglets
import { ExercisePageList } from "./ExercisePageList";
import { useExerciseFilters, useExercises, useFavorites } from "../../hooks";
import { Exercise } from "@/types/exercise";

type ExercisesListProps = {
  initialExercises: Exercise[];
  initialFavorites: string[];
  isAdmin: boolean;
  userId: string;
}

export default function ExercisesList({
  initialExercises,
  initialFavorites,
  isAdmin,
  userId,
}: ExercisesListProps) {
  // Récupération des exercices
  const { data: cachedExercises = [] } = useExercises(
    { userId, isAdmin, initialData: initialExercises },
  );

  // Récupération des favoris
  const { data: favoritesExercises = [] } = useFavorites(
    { userId, initialData: initialFavorites },
  );

  // Gestion des filtres et onglets
  const {
    activeTab,
    setActiveTab,
    selectedMuscle,
    setSelectedMuscle,
    grouped,
    counts,
    allExerciseMuscles,
    myExerciseMuscles,
    favoriteExerciseMuscles,
  } = useExerciseFilters({
    exercises: cachedExercises,
    favoritesExercises,
    isAdmin,
  });

  return (
    <ExercisePageList
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      counts={counts}
      allExerciseMuscles={allExerciseMuscles}
      selectedMuscle={selectedMuscle}
      setSelectedMuscle={setSelectedMuscle}
      myExerciseMuscles={myExerciseMuscles}
      favoriteExerciseMuscles={favoriteExerciseMuscles}
      grouped={grouped}
      favoritesExercises={favoritesExercises}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
}
