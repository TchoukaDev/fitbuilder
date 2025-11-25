"use client";
import {
  useExerciseFilters,
  useExercises,
  useFavorites,
} from "@/Features/Exercises/hooks";

import ExerciseConfiguration from "./ExerciseConfiguration";
import { useState } from "react";
import ExerciseSelector from "./ExerciceSelector/ExerciseSelector";

// Liste des exercices à ajouter dans l'entraînement
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
  const { data: cachedExercises = [], isLoading } = useExercises(
    userId,
    isAdmin,
    initialExercises,
  );

  // Récupérer favoris
  const { data: favorites = [], isLoading: loadingFavorites } = useFavorites(
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
    muscleCounts,
    fixedMuscleCounts,
    allExerciseMuscles,
    myExerciseMuscles,
    favoriteExerciseMuscles,
  } = useExerciseFilters({
    exercises: cachedExercises,
    favorites,
    isAdmin,
  });

  // Réupérer l'exercice sélectionné au complet
  const exerciseToConfigure = cachedExercises.filter(
    (ex) => ex._id === selectedExerciseId,
  )[0];

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
