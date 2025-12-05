"use client";
import { useMemo, useState } from "react";

/**
 * Gère les filtres (onglets, muscle, recherche) pour la liste d'exercices.
 *
 * @param {{ exercises?: any[], favoritesExercises?: string[], isAdmin?: boolean }} params
 */
export function useExerciseFilters({
  exercises = [],
  favoritesExercises = [],
  isAdmin,
}) {
  // --- STATES CONTROLÉS ---
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [search, setSearch] = useState("");

  // Sécurise favoritesExercises pour éviter l’erreur includes()
  const safeFavorites = Array.isArray(favoritesExercises)
    ? favoritesExercises
    : [];

  // ----------------------------
  // 1. Filtre Search
  // ----------------------------
  const searched = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ----------------------------
  // 2. Mes exercices / favoris
  // ----------------------------
  const myExercises = useMemo(
    () =>
      isAdmin
        ? searched.filter((ex) => ex.type === "public")
        : searched.filter((ex) => ex.type === "private"),
    [searched, isAdmin],
  );

  const favoriteExercises = useMemo(() =>
    searched.filter(
      (ex) => safeFavorites.includes(ex._id),
      [searched, safeFavorites],
    ),
  );

  // ----------------------------
  // 3. Muscles disponibles
  // ----------------------------
  const allExerciseMuscles = useMemo(
    () => [...new Set(searched.map((ex) => ex.muscle))].sort(),
    [searched],
  );
  const myExerciseMuscles = useMemo(
    () => [...new Set(myExercises.map((ex) => ex.muscle))].sort(),
    [myExercises],
  );
  const favoriteExerciseMuscles = useMemo(
    () => [...new Set(favoriteExercises.map((ex) => ex.muscle))].sort(),
    [favoriteExercises],
  );

  // ----------------------------
  // 4. Exercices affichés selon onglet + muscle
  // ----------------------------
  let displayed = useMemo(
    () =>
      activeTab === "all"
        ? searched
        : activeTab === "mine"
        ? myExercises
        : favoriteExercises,
    [activeTab, searched, myExercises, favoriteExercises],
  );

  // Calculer un compteur de muscle stable pour Le selecteur d'exercice dans Workout
  const displayedWithoutMuscleFilters = useMemo(() => displayed, [displayed]);
  const unfilteredGrouped = useMemo(
    () =>
      displayedWithoutMuscleFilters.reduce((acc, ex) => {
        if (!acc[ex.muscle]) acc[ex.muscle] = [];
        acc[ex.muscle].push(ex);
        return acc;
      }, {}),
    [displayedWithoutMuscleFilters],
  );

  const fixedMuscleCounts = useMemo(
    () =>
      Object.entries(unfilteredGrouped).reduce((acc, [muscle, exs]) => {
        acc[muscle] = exs.length;
        return acc;
      }, {}),
    [unfilteredGrouped],
  );

  // Ensuite filter par muscle
  if (selectedMuscle !== "all") {
    displayed = displayed.filter((ex) => ex.muscle === selectedMuscle);
  }

  // ----------------------------
  // 5. Groupage par muscle
  // ----------------------------
  const grouped = useMemo(
    () =>
      displayed.reduce((acc, ex) => {
        if (!acc[ex.muscle]) acc[ex.muscle] = [];
        acc[ex.muscle].push(ex);
        return acc;
      }, {}),
    [displayed],
  );

  // ----------------------------
  // 6. Compteurs
  // ----------------------------
  const counts = useMemo(
    () => ({
      all: searched.length,
      mine: myExercises.length,
      favorites: favoriteExercises.length,
    }),
    [searched, myExercises, favoriteExercises],
  );

  // Compteur d'exercice par muscle
  const muscleCounts = useMemo(
    () =>
      Object.entries(grouped).reduce((acc, [muscle, exs]) => {
        acc[muscle] = exs.length;
        return acc;
      }, {}),
    [grouped],
  );

  return {
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
  };
}
