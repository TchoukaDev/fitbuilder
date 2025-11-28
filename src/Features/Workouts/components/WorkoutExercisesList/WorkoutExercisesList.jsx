"use client";

// Liste et configuration des exercices à ajouter dans l'entraînement (flux en 2 étapes).
import {
  useExerciseFilters,
  useExercises,
  useFavorites,
} from "@/Features/Exercises/hooks";

import ExerciseConfiguration from "./ExerciseConfiguration";
import { useMemo, useState } from "react";
import ExerciseSelector from "./ExerciceSelector/ExerciseSelector";
export default function WorkoutExercisesList({
  userId,
  isAdmin,
  initialExercises,
  initialFavorites,
  exercisesAdded,
  onSelectExercise,
  onSetTitle,
}) {
  // State (étapes)

  const [step, setStep] = useState(1);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null); //id de l'exercice en cours de sélection

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
    activeTab,
    setActiveTab,
    selectedMuscle,
    setSelectedMuscle,
    search,
    setSearch,
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
  const exerciseToConfigure = useMemo(
    () => cachedExercises.filter((ex) => ex._id === selectedExerciseId)[0],
    [cachedExercises, selectedExerciseId],
  );

  let exerciseSelected;
  if (exerciseToConfigure) {
    const { _id, name } = exerciseToConfigure;
    exerciseSelected = { _id, name };
  }

  // RENDER

  // ETAPE 1: Sélection de l'exercice
  if (step === 1) {
    return (
      <ExerciseSelector
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        muscleCounts={fixedMuscleCounts}
        allExerciseMuscles={allExerciseMuscles}
        favoriteExerciseMuscles={favoriteExerciseMuscles}
        myExerciseMuscles={myExerciseMuscles}
        selectedMuscle={selectedMuscle}
        setSelectedMuscle={setSelectedMuscle}
        setSelectedExerciseId={setSelectedExerciseId}
        grouped={grouped}
        exercisesAdded={exercisesAdded}
        setStep={setStep}
        selectedExerciseId={selectedExerciseId}
        search={search}
        onSearchChange={setSearch}
        onSetTitle={onSetTitle}
      />
    );
  }

  //ETAPE 2: Configuration de l'exercice
  if (step === 2) {
    return (
      <ExerciseConfiguration
        exerciseSelected={exerciseSelected}
        setSelectedExerciseId={setSelectedExerciseId}
        onSelectExercise={onSelectExercise}
        setStep={setStep}
        onSetTitle={onSetTitle}
      />
    );
  }
}
