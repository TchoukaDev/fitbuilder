import { create } from "zustand";
import { SessionExercise, ActualSet } from "@/types/SessionExercise";

interface SessionStore {

  // Données
  exercises: SessionExercise[];
  currentExerciseIndex: number;
  isSaving: boolean;

  //
  setExercises: (exercises: SessionExercise[]) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setIsSaving: (isSaving: boolean) => void;
  updateExerciseSet: (exerciseIndex: number, setIndex: number, field: keyof ActualSet, value: number | boolean | undefined) => void;
  updateExerciseNotes: (exerciseIndex: number, value: string) => void;
  updateExerciseEffort: (exerciseIndex: number, value: number | null) => void;
  toggleExerciseSetComplete: (exerciseIndex: number, setIndex: number) => void;
  reopenExercise: (exerciseIndex: number) => void;
  saveToLocalStorage: (sessionId: string) => void;
  loadFromLocalStorage: (sessionId: string) => void;
  clearLocalStorage: (sessionId: string) => void;
  resetSession: (sessionId: string | null) => void;
}

const STORAGE_KEY_PREFIX = "session_backup_";

export const useSessionStore = create<SessionStore>((set, get) => ({
  // ============================================================
  // 📦 ÉTAT - State Management
  // ============================================================

  // État principal de la session
  exercises: [],
  currentExerciseIndex: 0,
  isSaving: false,

  // ============================================================
  // 🔧 ACTIONS - Gestion des Setters Simples
  // ============================================================

  setExercises: (exercises) => set({ exercises: exercises || [] }),

  setCurrentExerciseIndex: (index) => set({ currentExerciseIndex: index }),

  setIsSaving: (isSaving) => set({ isSaving }),

  // ============================================================
  // 💪 EXERCICES - Actions sur les Exercices
  // ============================================================

  updateExerciseSet: (exerciseIndex, setIndex, field, value) => {
    set((state) => {
      const newExercises = [...state.exercises];

      // Créer le set si n'existe pas
      if (!newExercises[exerciseIndex].actualSets[setIndex]) {
        newExercises[exerciseIndex].actualSets[setIndex] = {
          reps: undefined,
          weight: newExercises[exerciseIndex].targetWeight || undefined,
          completed: false,
        };
      }

       const currentSet = newExercises[exerciseIndex].actualSets[setIndex];
    
    if (field === "reps") currentSet.reps = value as number | undefined;
    if (field === "weight") currentSet.weight = value as number | undefined;
    if (field === "completed") currentSet.completed = value as boolean | undefined;

      return { exercises: newExercises };
    });
  },

  updateExerciseNotes: (exerciseIndex, value) => {
    set((state) => {
      const newExercises = [...state.exercises];
      newExercises[exerciseIndex].notes = value;
      return { exercises: newExercises };
    });
  },

  updateExerciseEffort: (exerciseIndex, value) => {
    set((state) => {
      const newExercises = [...state.exercises];
      newExercises[exerciseIndex].effort = value;
      return { exercises: newExercises };
    });
  },

  toggleExerciseSetComplete: (exerciseIndex, setIndex) => {
    set((state) => {
      const newExercises = [...state.exercises];
      const currentSet = newExercises[exerciseIndex].actualSets[setIndex];

      if (currentSet) {
        currentSet.completed = !currentSet.completed;
      }

      return { exercises: newExercises };
    });
  },

  reopenExercise: (exerciseIndex) => {
    set((state) => {
      const newExercises = [...state.exercises];
      newExercises[exerciseIndex].completed = false;

      return {
        exercises: newExercises,
        currentExerciseIndex: exerciseIndex,
      };
    });
  },

  // ============================================================
  // 💾 STOCKAGE - Actions de Persistance (LocalStorage)
  // ============================================================

  saveToLocalStorage: (sessionId) => {
    const { exercises } = get();
    const key = STORAGE_KEY_PREFIX + sessionId;
    localStorage.setItem(key, JSON.stringify(exercises));
  },

  loadFromLocalStorage: (sessionId) => {
    const key = STORAGE_KEY_PREFIX + sessionId;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const exercises = JSON.parse(stored);
        set({ exercises });
        return exercises;
      } catch (error) {
        console.error("Erreur lors du chargement du backup:", error);
        return null;
      }
    }
    return null;
  },

  clearLocalStorage: (sessionId) => {
    const key = STORAGE_KEY_PREFIX + sessionId;
    localStorage.removeItem(key);
  },

  // ============================================================
  // 🧹 NETTOYAGE - Reset
  // ============================================================

  resetSession: (sessionId = null) => {
    set({
      exercises: [],
      currentExerciseIndex: 0,
      isSaving: false,
    });

    // ✅ Nettoyer aussi le localStorage si sessionId fourni
    if (sessionId) {
      const key = STORAGE_KEY_PREFIX + sessionId;
      localStorage.removeItem(key);
    }
  },
}));
