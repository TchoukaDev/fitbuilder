// Hook pour gérer tous les handlers de la session d'exécution
// Les handlers modifient l'état global des exercises

import { useCallback } from "react";
import { useModals } from "@/Providers/Modals";
import { validateExercise } from "../utils";

/**
 * Hook central pour tous les handlers de session
 * Fournit des fonctions pour modifier les exercices et leurs séries
 */
export function useSessionHandlers(
  exercises,
  setExercises,
  setCurrentExerciseIndex,
  handleSaveProgress,
) {
  const { closeModal, openModal } = useModals();

  /**
   * Met à jour un champ d'une série d'un exercice
   * Utilisé pour modifier les reps, poids, ou marquer comme complété
   * @param {number} exerciseIndex - Position de l'exercice dans la liste (0, 1, 2...)
   * @param {number} setIndex - Position de la série dans l'exercice (0, 1, 2...)
   * @param {string} field - Le champ à modifier ('reps', 'weight', 'completed')
   * @param {any} value - La nouvelle valeur
   */
  const updateExerciseSet = useCallback(
    (exerciseIndex, setIndex, field, value) => {
      setExercises((prev) => {
        const newExercises = [...prev];

        // Créer la série si elle n'existe pas
        if (!newExercises[exerciseIndex].actualSets[setIndex]) {
          newExercises[exerciseIndex].actualSets[setIndex] = {
            reps: null,
            weight: newExercises[exerciseIndex].targetWeight || null,
            completed: false,
          };
        }
        // Mettre à jour le champ
        newExercises[exerciseIndex].actualSets[setIndex][field] = value;
        return newExercises;
      });
    },
    [setExercises],
  );

  /**
   * Met à jour les notes (commentaires) d'un exercice
   * @param {number} exerciseIndex - Position de l'exercice dans la liste
   * @param {string} value - Le texte des notes
   */
  const updateExerciseNotes = useCallback(
    (exerciseIndex, value) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        newExercises[exerciseIndex].notes = value;
        return newExercises;
      });
    },
    [setExercises],
  );

  /**
   * Met à jour l'effort ressenti (RPE: Rate of Perceived Exertion 1-10)
   * @param {number} exerciseIndex - Position de l'exercice dans la liste
   * @param {number|null} value - L'effort (1-10) ou null
   */
  const updateExerciseEffort = useCallback(
    (exerciseIndex, value) => {
      setExercises((prev) => {
        const newExercises = [...prev];

        if (!newExercises[exerciseIndex]) {
          console.error(`Exercise at index ${exerciseIndex} not found`);
          return prev;
        }

        newExercises[exerciseIndex].effort = value;
        return newExercises;
      });
    },
    [setExercises],
  );

  /**
   * Bascule l'état "complété" d'une série (cochée/décochée)
   * @param {number} exerciseIndex - Position de l'exercice dans la liste
   * @param {number} setIndex - Position de la série dans l'exercice
   */
  const toggleExerciseSetComplete = useCallback(
    (exerciseIndex, setIndex) => {
      const currentValue =
        exercises[exerciseIndex].actualSets?.[setIndex]?.completed || false;
      updateExerciseSet(exerciseIndex, setIndex, "completed", !currentValue);
    },
    [exercises, updateExerciseSet],
  );

  /**
   * Réouvre un exercice marqué comme terminé pour le modifier à nouveau
   * @param {number} exerciseIndex - Position de l'exercice à réouvrir
   */
  const reopenExercise = useCallback(
    (exerciseIndex) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        newExercises[exerciseIndex].completed = false;
        return newExercises;
      });
      setCurrentExerciseIndex(exerciseIndex);
    },
    [setExercises, setCurrentExerciseIndex],
  );

  /**
   * Marque un exercice comme terminé et passe au suivant
   * Utilisé après validation
   * @param {number} exerciseIndex - Position de l'exercice à terminer
   */
  const completeExerciseAndContinue = useCallback(
    (exerciseIndex) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i === exerciseIndex ? { ...ex, completed: true } : ex,
        ),
      );

      closeModal("incompleteExercise");

      // Passer au suivant
      if (exerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(exerciseIndex + 1);
      }

      // Sauvegarder la progression
      handleSaveProgress();
    },
    [
      setExercises,
      closeModal,
      exercises.length,
      setCurrentExerciseIndex,
      handleSaveProgress,
    ],
  );

  /**
   * Valide un exercice avant de le terminer
   * Ouvre une modale s'il y a des erreurs de validation
   * @param {number} exerciseIndex - Position de l'exercice à valider
   */
  const completeExercise = useCallback(
    (exerciseIndex) => {
      const validation = validateExercise(exercises, exerciseIndex);

      // Si validation échoue, ouvrir modale d'erreur
      if (!validation.isComplete) {
        openModal("incompleteExercise", { validation, exerciseIndex });
      } else {
        // Sinon, terminer l'exercice
        completeExerciseAndContinue(exerciseIndex);
      }
    },
    [exercises, openModal, completeExerciseAndContinue],
  );

  /**
   * Démarre le timer de repos entre les séries
   * @param {number} restTime - Durée du repos en secondes
   */
  const startRestTimer = useCallback(
    (restTime) => {
      openModal("restTimer", { restTime });
    },
    [openModal],
  );

  // Exporter les handlers avec les NOUVEAUX noms
  return {
    // ✅ Noms clairs et explicites
    updateExerciseSet,
    updateExerciseNotes,
    updateExerciseEffort,
    toggleExerciseSetComplete,
    reopenExercise,
    completeExercise,
    markExerciseAsComplete: completeExerciseAndContinue, // ✅ Pour "Terminer quand même"
    startRestTimer,

    // ⚠️ Anciens noms (pour compatibilité temporaire)
    // À retirer après mise à jour des composants
    handleSetChange: updateExerciseSet,
    handleNotesChange: updateExerciseNotes,
    handleEffortChange: updateExerciseEffort,
    handleSetComplete: toggleExerciseSetComplete,
    handleReopenExercise: reopenExercise,
    handleExerciseComplete: completeExercise,
    handleRestTimer: startRestTimer,
  };
}
