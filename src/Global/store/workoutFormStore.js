import { create } from "zustand";

export const useWorkoutFormStore = create((set) => ({
  // create = créer un store
  exercises: [], // État initial (comme useState)

  addExercise: (exercise) =>
    set((state) => ({
      // set = modifier l'état
      // state = état actuel
      // on retourne le NOUVEL état
      exercises: [...state.exercises, exercise],
    })),
}));
