import { useState } from "react";

/**
 * Gère l'état global d'exécution d'une session (exercices, index courant, sauvegarde).
 *
 * @param {{ exercises: any[] }} sessionData - Données initiales de la session.
 */
export function useSessionState(sessionData) {
  const [exercises, setExercises] = useState(sessionData.exercises); //Exercises de la session
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0); //Exercice en cours d'exécution

  const [isSaving, setIsSaving] = useState(false); //Etat de sauvegarde de la session

  // Variables
  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalExercises = exercises.length;
  return {
    // State
    exercises,
    setExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isSaving,
    setIsSaving,
    // Variables
    completedCount,
    totalExercises,
  };
}
