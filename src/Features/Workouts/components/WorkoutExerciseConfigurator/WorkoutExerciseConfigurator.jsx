"use client";

// Liste et configuration des exercices à ajouter dans l'entraînement (flux en 2 étapes).
import { useExercises, useFavorites } from "@/Features/Exercises/hooks";
import ExerciseConfiguration from "./ExerciseConfiguration";
import { useMemo } from "react";
import ExerciseSelector from "./ExerciceSelector/ExerciseSelector";
import { useWorkoutStore } from "../../store";

export default function WorkoutExerciseConfigurator({
  userId,
  isAdmin,
  initialExercises,
  initialFavorites,
}) {
  // Store
  const step = useWorkoutStore((state) => state.step);
  const selectedExerciseId = useWorkoutStore(
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
        exercises={cachedExercises}
        favoritesExercises={favoritesExercises}
        isAdmin={isAdmin}
      />
    );
  }

  //ETAPE 2: Configuration de l'exercice
  if (step === 2) {
    return <ExerciseConfiguration exerciseSelected={exerciseSelected} />;
  }
}
