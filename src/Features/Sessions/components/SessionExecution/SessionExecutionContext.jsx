"use client";

import { createContext, useContext } from "react";

/**
 * Context pour partager les handlers de SessionExecution
 * Évite le prop drilling en fournissant tous les handlers centralement
 *
 * Handlers disponibles :
 * - updateExerciseSet(exerciseIndex, setIndex, field, value)
 * - updateExerciseNotes(exerciseIndex, value)
 * - updateExerciseEffort(exerciseIndex, value)
 * - toggleExerciseSetComplete(exerciseIndex, setIndex)
 * - completeExercise(exerciseIndex)
 * - reopenExercise(exerciseIndex)
 * - startRestTimer(restTime)
 */
const SessionExecutionContext = createContext(null);

/**
 * Provider qui fournit tous les handlers aux composants enfants
 * @param {Object} props
 * @param {React.ReactNode} props.children - Les composants enfants
 * @param {Object} props.handlers - L'objet avec tous les handlers
 */
export function SessionExecutionProvider({ children, handlers }) {
  return (
    <SessionExecutionContext.Provider value={handlers}>
      {children}
    </SessionExecutionContext.Provider>
  );
}

/**
 * Hook pour accéder aux handlers du Context
 * Utilisez-le dans les composants enfants du Provider
 *
 * @returns {Object} Les handlers disponibles
 * @throws {Error} Si utilisé en dehors du Provider
 *
 * @example
 * const { updateExerciseSet, completeExercise } = useSessionExecutionContext();
 */
export function useSessionExecutionContext() {
  const context = useContext(SessionExecutionContext);

  if (!context) {
    throw new Error(
      "useSessionExecutionContext doit être utilisé dans SessionExecutionProvider",
    );
  }

  return context;
}
