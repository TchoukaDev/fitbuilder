"use client";

import { ExercisePageList } from "./ExercisePageList";
import { useExerciseFilters, useExercises, useFavorites } from "../../hooks";

export default function ExercisesList({
  initialExercises,
  initialFavorites,
  isAdmin,
  userId,
}) {
  // HOOKS

  // Récupérer exercices
  const { data: cachedExercises = [] } = useExercises(
    userId,
    isAdmin,
    initialExercises,
  );

  // Récupérer favoris
  const { data: favorites = [] } = useFavorites(userId, initialFavorites);

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
  } = useExerciseFilters({ exercises: cachedExercises, favorites, isAdmin });

  // LISTE POUR PAGE EXERCICES
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
      favorites={favorites}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
}
