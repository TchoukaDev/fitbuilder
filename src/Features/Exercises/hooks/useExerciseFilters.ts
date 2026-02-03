"use client";
import { Exercise } from "@/types/exercise";
import { useMemo, useState } from "react";

/**
 * Gère les filtres (onglets, muscle, recherche) pour la liste d'exercices.
 */

// ========== TYPES ==========
/** Un dictionnaire muscle => liste d'exercices */
type ExercisesByMuscle = Record<string, Exercise[]>;

/** Un dictionnaire muscle => nombre d'exercices */
type MuscleCounters = Record<string, number>;

type UseExerciseFiltersProps = {
  exercises: Exercise[];
  favoritesExercises: string[];
  isAdmin: boolean;
};
export function useExerciseFilters({
  exercises = [],
  favoritesExercises = [],
  isAdmin = false,
}: UseExerciseFiltersProps) {

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [search, setSearch] = useState<string>("");


  // ----------------------------
  // 1. Filtre Search
  // ----------------------------
  // ✅ Tous les exercices qui matchent le texte de recherche
  // Ex: search = "bench" => [Bench Press, Dumbbell Bench...]
  const searched = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ----------------------------
  // 2. Mes exercices / favoris
  // ----------------------------
  const myExercises = useMemo(
    () =>
      isAdmin
        ? searched.filter((ex) => ex.isPublic)
        : searched.filter((ex) => !ex.isPublic),
    [searched, isAdmin],
  );

  const favoriteExercises = useMemo(() =>
    searched.filter((ex) => favoritesExercises.includes(ex.exerciseId)),
    [searched, favoritesExercises],
  );

  // ----------------------------
  // 3. Muscles disponibles
  // ----------------------------
  // ✅ Liste unique des muscles dans tous les exercices selon l'onglet actif
  // Ex: ["poitrine", "dos", "jambes", "épaules"]
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

  // ✅ Groupé par muscle AVANT le filtre muscle (pour des compteurs stables)
  // Ex: { "poitrine": [ex1, ex2], "dos": [ex3, ex4] }
  const displayedWithoutMuscleFilters = useMemo(() => displayed, [displayed]);
  const unfilteredGrouped = useMemo(
    () =>
      displayedWithoutMuscleFilters.reduce<ExercisesByMuscle>((acc, ex) => {
        if (!acc[ex.muscle]) acc[ex.muscle] = [];
        acc[ex.muscle].push(ex);
        return acc;
      }, {}),
    [displayedWithoutMuscleFilters],
  );

  // ✅ Compteurs des muscles AVANT filtre (pour afficher le nombre total par muscle)
  // Ex: { "poitrine": 2, "dos": 2, "jambes": 1 }
  const fixedMuscleCounts = useMemo(
    () =>
      Object.entries(unfilteredGrouped).reduce<MuscleCounters>((acc, [muscle, exs]) => {
        acc[muscle] = exs.length;
        return acc;
      }, {}),
    [unfilteredGrouped],
  );

  // Ensuite filtrer par muscle sélectionné
  if (selectedMuscle !== "all") {
    displayed = displayed.filter((ex) => ex.muscle === selectedMuscle);
  }

  // ----------------------------
  // 5. Groupage par muscle (FINAL)
  // ----------------------------
  // ✅ Les exercices affichés GROUPÉS par muscle (après tous les filtres)
  // Ex: { "poitrine": [ex1, ex2], "dos": [ex3] }
  const grouped = useMemo(
    () =>
      displayed.reduce<ExercisesByMuscle>((acc, ex) => {
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

  // ✅ Nombre d'exercices par muscle APRÈS filtres
  // Ex: { "poitrine": 2, "dos": 1 }
  const muscleCounts = useMemo(
    () =>
      Object.entries(grouped).reduce<MuscleCounters>((acc, [muscle, exs]) => {
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
