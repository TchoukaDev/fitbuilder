"use client";
import { useState } from "react";

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
  const myExercises = isAdmin
    ? searched.filter((ex) => ex.type === "public")
    : searched.filter((ex) => ex.type === "private");

  const favoriteExercises = searched.filter((ex) =>
    safeFavorites.includes(ex._id),
  );

  // ----------------------------
  // 3. Muscles disponibles
  // ----------------------------
  const allExerciseMuscles = [
    ...new Set(searched.map((ex) => ex.muscle)),
  ].sort();
  const myExerciseMuscles = [
    ...new Set(myExercises.map((ex) => ex.muscle)),
  ].sort();
  const favoriteExerciseMuscles = [
    ...new Set(favoriteExercises.map((ex) => ex.muscle)),
  ].sort();

  // ----------------------------
  // 4. Exercices affichés selon onglet + muscle
  // ----------------------------
  let displayed =
    activeTab === "all"
      ? searched
      : activeTab === "mine"
      ? myExercises
      : favoriteExercises;

  // Calculer un compteur de muscle stable pour Le selecteur d'exercice dans Workout
  const displayedWithoutMuscleFilters = displayed;
  const unfilteredGrouped = displayedWithoutMuscleFilters.reduce((acc, ex) => {
    if (!acc[ex.muscle]) acc[ex.muscle] = [];
    acc[ex.muscle].push(ex);
    return acc;
  }, {});

  const fixedMuscleCounts = Object.entries(unfilteredGrouped).reduce(
    (acc, [muscle, exs]) => {
      acc[muscle] = exs.length;
      return acc;
    },
    {},
  );

  // Ensuite filter par muscle
  if (selectedMuscle !== "all") {
    displayed = displayed.filter((ex) => ex.muscle === selectedMuscle);
  }

  // ----------------------------
  // 5. Groupage par muscle
  // ----------------------------
  const grouped = displayed.reduce((acc, ex) => {
    if (!acc[ex.muscle]) acc[ex.muscle] = [];
    acc[ex.muscle].push(ex);
    return acc;
  }, {});

  // ----------------------------
  // 6. Compteurs
  // ----------------------------
  const counts = {
    all: searched.length,
    mine: myExercises.length,
    favorites: favoriteExercises.length,
  };

  // Compteur d'exercice par muscle
  const muscleCounts = Object.entries(grouped).reduce((acc, [muscle, exs]) => {
    acc[muscle] = exs.length;
    return acc;
  }, {});

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
