"use client";

import { useState } from "react";
import { useExercises, useFavorites } from "@/hooks/useExercises";
import ExerciceSelector from "@/components/Workouts/CreateWorkout/ExerciceSelector/ExerciceSelector";
import ExerciseConfiguration from "@/components/Workouts/CreateWorkout/ExerciseConfiguration/ExerciseConfiguration";
import ExercisePageList from "../ExercisePageList/ExercisePageList";

export default function ExercisesList({
  initialExercises,
  initialFavorites,
  isAdmin,
  userId,
  inModal,
  exercisesAdded,
  onCloseExerciseSelector,
  onSelectExercise,
}) {
  // HOOKS

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

  // STATE
  const [activeTab, setActiveTab] = useState("all"); //all, mine, favorites
  const [selectedMuscle, setSelectedMuscle] = useState("all"); //Muscle sélectionné
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null); //id de l'exercice en cours de sélection

  // ✅ Filtrer avec la recherche
  const exercises = cachedExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Réupérer l'exercice sélectionné au complet
  const exerciseToConfigure = exercises.filter(
    (ex) => ex._id === selectedExerciseId,
  )[0];

  let exerciseSelected;
  if (exerciseToConfigure) {
    const { _id, name } = exerciseToConfigure;
    exerciseSelected = { _id, name };
  }

  // Exercices de l'utilisateur (privés) ou public si admin
  const myExercises = isAdmin
    ? exercises?.filter((ex) => ex.type === "public")
    : exercises?.filter((ex) => ex.type === "private");

  // Récupérer les détails des exercices favoris avec leur id (données db)
  const favoriteExercises = exercises.filter((ex) =>
    favorites.includes(ex._id),
  );

  //  Muscles travaillés dans les exercices
  const allExerciseMuscles = [
    ...new Set(exercises.map((ex) => ex.muscle)),
  ].sort();
  const myExerciseMuscles = [
    ...new Set(myExercises.map((ex) => ex.muscle)),
  ].sort();
  const favoriteExerciseMuscles = [
    ...new Set(favoriteExercises.map((ex) => ex.muscle)),
  ].sort();

  // Fonction qui retourne le nombre d'exercice par muscle pour TOUS les exercices (filtrés si search)
  const countByMuscle = (exercises) => {
    // Groupe global : tous les exercices par muscle
    const allGrouped = exercises.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});

    // Compteur pour les options
    const muscleCounts = Object.fromEntries(
      Object.entries(allGrouped).map(([muscle, exs]) => [muscle, exs.length]),
    );

    return muscleCounts;
  };

  // Exercices à afficher selon l'onglet
  let displayedExercises = [];
  let muscleCounts;
  if (activeTab === "all") {
    muscleCounts = countByMuscle(exercises);
    displayedExercises =
      selectedMuscle === "all"
        ? exercises //si "all -> Tous les exercices
        : exercises.filter((ex) => ex.muscle === selectedMuscle); //Sinon les exercices du muscle sélectionné
  } else if (activeTab === "mine") {
    muscleCounts = countByMuscle(myExercises);
    displayedExercises =
      selectedMuscle === "all"
        ? myExercises
        : myExercises.filter((ex) => ex.muscle === selectedMuscle);
  } else if (activeTab === "favorites") {
    muscleCounts = countByMuscle(favoriteExercises);
    displayedExercises =
      selectedMuscle === "all"
        ? favoriteExercises
        : favoriteExercises.filter((ex) => ex.muscle === selectedMuscle);
  }

  // Nombre d'exercice par muscle pour CHAQUE TYPE d'exercice (DisplayedExercises)
  const grouped = displayedExercises.reduce((acc, ex) => {
    if (!acc[ex.muscle]) acc[ex.muscle] = [];
    acc[ex.muscle].push(ex);
    return acc;
  }, {});

  // Compteurs pour les onglets
  const counts = {
    all: exercises.length || 0,
    mine: myExercises?.length || 0,
    favorites: favorites?.length || 0,
  };

  // RENDER

  // MODALE POUR WORKOUT
  if (inModal) {
    // ETAPE 1: Sélection de l'exercice
    if (step === 1) {
      return (
        <ExerciceSelector
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          muscleCounts={muscleCounts}
          allExerciseMuscles={allExerciseMuscles}
          favoriteExerciseMuscles={favoriteExerciseMuscles}
          myExerciseMuscles={myExerciseMuscles}
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          setSelectedExerciseId={setSelectedExerciseId}
          grouped={grouped}
          exercisesAdded={exercisesAdded}
          setStep={setStep}
          onCloseExerciseSelector={onCloseExerciseSelector}
          selectedExerciseId={selectedExerciseId}
          search={search}
          onSearchChange={setSearch}
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
          onCloseExerciseSelector={onCloseExerciseSelector}
        />
      );
    }
  }

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
