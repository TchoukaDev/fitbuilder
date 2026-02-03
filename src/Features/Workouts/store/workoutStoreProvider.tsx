"use client";

// Chaque formulaire a son propre Provider = son propre état isolé.
//
// COMMENT ÇA MARCHE ?
// -------------------
// 1. createWorkoutStore() = fonction qui CRÉE un nouveau store
// 2. WorkoutStoreProvider = composant qui crée UN store et le partage via Context
// 3. useWorkoutStore() = hook qui récupère le store du Context parent

import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { create } from "zustand";
import { WorkoutExercise } from "@/types/workoutExercise";

interface WorkoutStore {


  // Données
  exercises: WorkoutExercise[];
  autoSave: boolean;
  step: number;
  isMounted: boolean;
  selectedExerciseId: string | null;
  errorExercises: string | null;
  errorSelectedExerciseId: string | null;
  modaleTitle: string;

  // Actions
  setIsMounted: (isMounted: boolean) => void;
  setStep: (step: number) => void;
  setSelectedExerciseId: (exerciseId: string | null) => void;
  setErrorSelectedExerciseId: (error: string | null) => void;
  setErrorExercises: (error: string | null) => void;
  setModaleTitle: (title: string) => void;
  setExercises: (exercises: WorkoutExercise[]) => void;
  addExercise: (exercise: WorkoutExercise) => void;
  updateExercise: (index: number, updatedExercise: WorkoutExercise) => void;
  removeExercise: (index: number) => void;
  moveExercise: (index: number, direction: "up" | "down") => void;
  saveExercisesToStorage: (exercises: WorkoutExercise[], autoSave: boolean) => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
  clearAll: () => void;
}

// ============================================================
// 🏭 FACTORY : Fonction qui crée un nouveau store
// ============================================================
//
// C'est ta logique actuelle, mais dans une FONCTION.
// Chaque appel à createWorkoutStore() crée un store INDÉPENDANT.
//
const createWorkoutStore = () =>
  create<WorkoutStore>((set, get) => ({
    // ============================================================
    // 📦 ÉTAT - State Management
    // ============================================================

    autoSave: true,
    // État principal du formulaire
    exercises: [],
    step: 1,
    isMounted: false,

    // État de la sélection
    selectedExerciseId: null,

    // État des erreurs
    errorExercises: null,
    errorSelectedExerciseId: null,

    // État de la modale
    modaleTitle: "",

    // ============================================================
    // 🔧 ACTIONS - Gestion des Setters Simples
    // ============================================================

    setIsMounted: (isMounted) => set({ isMounted }),


    setStep: (step) => set({ step }),

    setSelectedExerciseId: (exerciseId) =>
      set({ selectedExerciseId: exerciseId }),

    setErrorSelectedExerciseId: (error) =>
      set({ errorSelectedExerciseId: error }),

    setErrorExercises: (error) => set({ errorExercises: error }),

    setModaleTitle: (title) => set({ modaleTitle: title }),

    // ============================================================
    // 💪 EXERCICES - Actions sur les Exercices
    // ============================================================

    setExercises: (exercises) => {
      set({
        exercises: exercises || [],
        isMounted: true,
      });
    },

    addExercise: (exercise) => {
      set((state) => ({
        exercises: [
          ...state.exercises,
          { ...exercise, order: state.exercises.length + 1 },
        ],
      }));

      const { exercises } = get();
      get().saveExercisesToStorage(exercises, get().autoSave);
    },

    updateExercise: (index, updatedExercise) => {
      set((state) => ({
        exercises: state.exercises.map((ex, i) =>
          i === index ? { ...updatedExercise, order: ex.order } : ex,
        ),
      }));

      const { exercises } = get();
      get().saveExercisesToStorage(exercises, get().autoSave);
    },

    removeExercise: (index) => {
      set((state) => ({
        exercises: state.exercises
          .filter((_, i) => i !== index)
          .map((ex, i) => ({ ...ex, order: i + 1 })),
      }));

      const { exercises } = get();
      get().saveExercisesToStorage(exercises, get().autoSave);
    },

    moveExercise: (index, direction) => {
      set((state) => {
        const arrayExercises = [...state.exercises];

        if (direction === "up" && index > 0) {
          [arrayExercises[index - 1], arrayExercises[index]] = [
            arrayExercises[index],
            arrayExercises[index - 1],
          ];
        }

        if (direction === "down" && index < arrayExercises.length - 1) {
          [arrayExercises[index], arrayExercises[index + 1]] = [
            arrayExercises[index + 1],
            arrayExercises[index],
          ];
        }

        return {
          exercises: arrayExercises.map((ex, i) => ({ ...ex, order: i + 1 })),
        };
      });

      const { exercises } = get();
      get().saveExercisesToStorage(exercises, get().autoSave);
    },

    // ============================================================
    // 💾 STOCKAGE - Actions de Persistance (LocalStorage)
    // ============================================================

    saveExercisesToStorage: (exercises, autoSave) => {
      if (!autoSave) return;

      localStorage.setItem("exercises", JSON.stringify(exercises));

    },

    loadFromStorage: () => {
      const stored = localStorage.getItem("exercises");
      if (stored) {
        set({ exercises: JSON.parse(stored), isMounted: true });

      } else {
        set({ isMounted: true });
      }
    },

    clearStorage: () => {
      localStorage.removeItem("exercises");
    },

    // ============================================================
    // 🧹 NETTOYAGE - Reset
    // ============================================================

    clearAll: () => {
      set({
        errorExercises: null,
        errorSelectedExerciseId: null,
        selectedExerciseId: null,
        step: 1,
      });
    },
  }));
// ============================================================
// 🌐 CONTEXT : Pour distribuer le store aux enfants
// ============================================================
//
// Le Context ne stocke PAS l'état (donc pas de re-renders).
// Il stocke juste une RÉFÉRENCE au store Zustand.
//
const WorkoutStoreContext = createContext<ReturnType<typeof createWorkoutStore> | null>(null);

// ============================================================
// 🎁 PROVIDER : Crée et fournit un store unique
// ============================================================
//
// Chaque <WorkoutStoreProvider> crée son propre store.

export function WorkoutStoreProvider({ children, autoSave = true }: { children: React.ReactNode, autoSave: boolean }) {
  // useRef pour créer le store UNE SEULE FOIS par Provider
  // (même si le composant parent re-render)
  const storeRef = useRef<ReturnType<typeof createWorkoutStore> | null>(null);


  if (!storeRef.current) {
    // Premier rendu : créer le store
    storeRef.current = createWorkoutStore();
    storeRef.current.setState({ autoSave }); // applique le flag
  }

  return (
    <WorkoutStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkoutStoreContext.Provider>
  );
}

// ============================================================
// 🪝 HOOK : Récupérer le store du Context
// ============================================================
//
// Remplace ton ancien useWorkoutStore.
// Fonctionne EXACTEMENT pareil avec les selectors :
//
// const exercises = useWorkoutStore((state) => state.exercises);
// const addExercise = useWorkoutStore((state) => state.addExercise);
//
// La seule différence : il récupère le store du Context parent
// au lieu d'utiliser un singleton global.
//
export function useWorkoutStore<T>(selector: (state: WorkoutStore) => T): T {
  const store = useContext(WorkoutStoreContext);


  // Erreur explicite si utilisé hors d'un Provider
  if (!store) {
    throw new Error(
      "useWorkoutStore doit être utilisé à l'intérieur d'un <WorkoutStoreProvider>",
    );
  }

  // useStore de Zustand : applique le selector et gère les re-renders
  return useStore(store, selector);
}