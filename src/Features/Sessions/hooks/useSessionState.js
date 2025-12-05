import { useEffect, useMemo } from "react";
import { useSessionStore } from "../store";

/**
 * Initialise et gère l'état global d'exécution d'une session via Zustand.
 *
 * Ce hook :
 * - Initialise le store au montage avec les données de la session
 * - Retourne les sélecteurs pour accéder à l'état
 * - Calcule les valeurs dérivées (compteurs)
 *
 * @param {{ exercises: any[] }} sessionData - Données initiales de la session.
 */
export function useSessionState(sessionData) {
  // Sélecteurs Zustand
  const exercises = useSessionStore((state) => state.exercises);
  const currentExerciseIndex = useSessionStore(
    (state) => state.currentExerciseIndex,
  );
  const isSaving = useSessionStore((state) => state.isSaving);
  const setExercises = useSessionStore((state) => state.setExercises);
  const setCurrentExerciseIndex = useSessionStore(
    (state) => state.setCurrentExerciseIndex,
  );

  // Initialisation au montage du composant
  useEffect(() => {
    if (sessionData?.exercises?.length) {
      setExercises(sessionData.exercises);
      setCurrentExerciseIndex(0);
    }
  }, [sessionData?.exercises, setExercises, setCurrentExerciseIndex]);

  // Variables calculées
  const completedCount = useMemo(
    () => exercises.filter((ex) => ex.completed).length,
    [exercises],
  );
  const totalExercises = exercises.length;

  return {
    // État (depuis le store)
    exercises,
    currentExerciseIndex,
    isSaving,
    // Variables calculées
    completedCount,
    totalExercises,
  };
}
