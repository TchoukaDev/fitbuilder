"use client";

// Liste et configuration des exercices à ajouter dans l'entraînement (flux en 2 étapes).
import {
  useExerciseFilters,
  useExercises,
  useFavorites,
} from "@/Features/Exercises/hooks";

import ExerciseConfiguration from "./ExerciseConfiguration";
import { useMemo } from "react";
import ExerciseSelector from "./ExerciceSelector/ExerciseSelector";
import { useWorkoutFormStore } from "../../store";

export default function WorkoutExercisesList({
  userId,
  isAdmin,
  initialExercises,
  initialFavorites,
}) {
  // Store
  const step = useWorkoutFormStore((state) => state.step);
  const selectedExerciseId = useWorkoutFormStore(
    (state) => state.selectedExerciseId,
  );

  // Récupérer exercices
  const { data: cachedExercises = [] } = useExercises(
    userId,
    isAdmin,
    initialExercises,
  );

  // Récupérer favoris
  const { data: favoritesExercises = [] } = useFavorites(
    userId,
    initialFavorites,
  );

  // Filtres
  const {
    grouped,
    counts,
    fixedMuscleCounts,
    allExerciseMuscles,
    myExerciseMuscles,
    favoriteExerciseMuscles,
  } = useExerciseFilters({
    exercises: cachedExercises,
    favoritesExercises,
    isAdmin,
  });

  // Réupérer l'exercice sélectionné au complet
  const exerciseSelected = useMemo(
    () => cachedExercises.filter((ex) => ex._id === selectedExerciseId)[0],
    [cachedExercises, selectedExerciseId],
  );

  // RENDER

  // ETAPE 1: Sélection de l'exercice
  if (step === 1) {
    return (
      <ExerciseSelector
        counts={counts}
        muscleCounts={fixedMuscleCounts}
        allExerciseMuscles={allExerciseMuscles}
        favoriteExerciseMuscles={favoriteExerciseMuscles}
        myExerciseMuscles={myExerciseMuscles}
        grouped={grouped}
      />
    );
  }

  //ETAPE 2: Configuration de l'exercice
  if (step === 2) {
    return <ExerciseConfiguration exerciseSelected={exerciseSelected} />;
  }
}
