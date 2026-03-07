"use client";
import { Exercise } from "@/types/exercise";
import { getMuscleCategory } from "../utils/muscleCategory";
import { useMemo, useState } from "react";

/**
 * Gère les filtres (onglets, muscle, recherche) pour la liste d'exercices.
 */

// ========== TYPES ==========
/** Un dictionnaire muscle => liste d'exercices */
type ExercisesByMuscle = Record<string, Exercise[]>;

/** Un dictionnaire muscle => nombre d'exercices */
type MuscleCounters = Record<string, number>;

/** Groupe de muscles pour le <select> avec <optgroup> */
export type MuscleSelectGroup = { label: string; muscles: { name: string; count: number }[] };

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
  const [selectedSecondaryMuscle, setSelectedSecondaryMuscle] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const handleSetSelectedMuscle = (muscle: string) => {
    setSelectedMuscle(muscle);
    setSelectedSecondaryMuscle("all");
  };


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
    () => [...new Set(searched.map((ex) => getMuscleCategory(ex.primary_muscle)))].sort(),
    [searched],
  );
  const myExerciseMuscles = useMemo(
    () => [...new Set(myExercises.map((ex) => getMuscleCategory(ex.primary_muscle)))].sort(),
    [myExercises],
  );
  const favoriteExerciseMuscles = useMemo(
    () => [...new Set(favoriteExercises.map((ex) => getMuscleCategory(ex.primary_muscle)))].sort(),
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
        const cat = getMuscleCategory(ex.primary_muscle);
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ex);
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

  // Filtre par catégorie primaire
  const displayedAfterPrimary = useMemo(
    () =>
      selectedMuscle === "all"
        ? displayed
        : displayed.filter((ex) => getMuscleCategory(ex.primary_muscle) === selectedMuscle),
    [displayed, selectedMuscle],
  );

  // Muscles secondaires disponibles avec compteurs selon le filtre primaire
  const availableSecondaryMuscles = useMemo((): { name: string; count: number }[] => {
    if (selectedMuscle === "all") return [];
    const countMap = new Map<string, number>();
    displayedAfterPrimary.forEach((ex) => {
      (ex.secondary_muscles ?? []).forEach((m) => {
        countMap.set(m, (countMap.get(m) ?? 0) + 1);
      });
    });
    return [...countMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));
  }, [displayedAfterPrimary, selectedMuscle]);

  // Options du <select> groupées par catégorie avec compteurs (filtre sur primary_muscle granulaire)
  const muscleSelectGroups = useMemo((): MuscleSelectGroup[] => {
    const byCategory: Record<string, Map<string, number>> = {};
    displayedAfterPrimary.forEach((ex) => {
      const cat = getMuscleCategory(ex.primary_muscle);
      if (!byCategory[cat]) byCategory[cat] = new Map();
      byCategory[cat].set(ex.primary_muscle, (byCategory[cat].get(ex.primary_muscle) ?? 0) + 1);
    });
    return Object.entries(byCategory)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, muscleMap]) => ({
        label,
        muscles: [...muscleMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, count]) => ({ name, count })),
      }));
  }, [displayedAfterPrimary]);

  // Filtre final : muscle primaire granulaire (applicable avec ou sans filtre catégorie)
  if (selectedSecondaryMuscle !== "all") {
    displayed = displayedAfterPrimary.filter((ex) => ex.primary_muscle === selectedSecondaryMuscle);
  } else {
    displayed = displayedAfterPrimary;
  }

  // ----------------------------
  // 5. Groupage par muscle (FINAL)
  // ----------------------------
  // ✅ Les exercices affichés GROUPÉS par muscle (après tous les filtres)
  // Ex: { "poitrine": [ex1, ex2], "dos": [ex3] }
  const grouped = useMemo(
    () =>
      displayed.reduce<ExercisesByMuscle>((acc, ex) => {
        const cat = getMuscleCategory(ex.primary_muscle);
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ex);
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
    setSelectedMuscle: handleSetSelectedMuscle,
    selectedSecondaryMuscle,
    setSelectedSecondaryMuscle,
    availableSecondaryMuscles,
    muscleSelectGroups,
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
