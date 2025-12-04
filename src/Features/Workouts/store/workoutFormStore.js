import { create } from "zustand";

const STORAGE_KEY = "exercises";

export const useWorkoutFormStore = create((set, get) => ({
  // ============================================================
  // 📦 ÉTAT - State Management
  // ============================================================

  // État principal du formulaire
  exercises: [],
  step: 1,
  isMounted: false,

  // État de la sélection
  selectedExerciseId: null,

  // État des filtres
  activeTab: "all",
  selectedMuscle: "all",
  search: "",

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
  // 🎯 FILTRES - Actions sur les Filtres
  // ============================================================

  setActiveTab: (activeTab) => set({ activeTab }),

  setSelectedMuscle: (selectedMuscle) => set({ selectedMuscle }),

  setSearch: (search) => set({ search }),

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
    get().saveExercisesToStorage(exercises);
  },

  updateExercise: (index, updatedExercise) => {
    set((state) => ({
      exercises: state.exercises.map((ex, i) =>
        i === index ? { ...updatedExercise, order: ex.order } : ex,
      ),
    }));

    const { exercises } = get();
    get().saveExercisesToStorage(exercises);
  },

  removeExercise: (index) => {
    set((state) => ({
      exercises: state.exercises
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order: i + 1 })),
    }));

    const { exercises } = get();
    get().saveExercisesToStorage(exercises);
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
    get().saveExercisesToStorage(exercises);
  },

  // ============================================================
  // 💾 STOCKAGE - Actions de Persistance (LocalStorage)
  // ============================================================

  saveExercisesToStorage: (exercises) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ exercises: JSON.parse(stored), isMounted: true });
    } else {
      set({ isMounted: true });
    }
  },

  clearStorage: () => {
    localStorage.removeItem(STORAGE_KEY);
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
      activeTab: "all",
      selectedMuscle: "all",
      search: "",
    });
  },
}));
