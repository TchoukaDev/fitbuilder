import { useEffect, useRef } from "react";
import { useWorkoutFormStore } from "@/Features/Workouts/store/workoutFormStore";
import { useModals } from "@/Providers/Modals";

/**
 * Hook custom pour gérer la logique commune des formulaires de workout
 * @param {Object} options
 * @param {Array} options.initialExercises - Exercices initiaux (pour UpdateForm)
 * @param {boolean} options.loadFromStorage - Charger depuis localStorage (pour NewForm)
 */
export function useWorkoutForm({
  initialExercises = null,
  loadFromStorage = false,
}) {
  const { closeModal, getModalData } = useModals();
  // ========================================
  // 🏪 ZUSTAND
  // ========================================
  const exercises = useWorkoutFormStore((state) => state.exercises);
  const setExercises = useWorkoutFormStore((state) => state.setExercises);
  const setErrorExercises = useWorkoutFormStore(
    (state) => state.setErrorExercises,
  );
  const errorExercises = useWorkoutFormStore((state) => state.errorExercises);
  const isMounted = useWorkoutFormStore((state) => state.isMounted);
  const setIsMounted = useWorkoutFormStore((state) => state.setIsMounted);
  const removeExercise = useWorkoutFormStore((state) => state.removeExercise);

  const loadFromStorageAction = useWorkoutFormStore(
    (state) => state.loadFromStorage,
  );
  const clearAll = useWorkoutFormStore((state) => state.clearAll);
  const clearStorage = useWorkoutFormStore((state) => state.clearStorage);

  // ========================================
  // 📌 REF pour le focus
  // ========================================
  const nameRef = useRef(null);

  // 🔥 Handler pour la suppression d'exercice
  const handleDeleteExercise = () => {
    const index = getModalData("deleteConfirm").index;
    removeExercise(index);
    closeModal("deleteConfirm");
  };

  // ========================================
  // ⚡ EFFECT 1 : Montage + Démontage
  // ========================================
  useEffect(() => {
    // Au montage : initialiser
    if (loadFromStorage) {
      // Mode Création : charger depuis localStorage
      loadFromStorageAction();
    } else if (initialExercises) {
      // Mode Édition : charger les exercices du workout
      setExercises(initialExercises);
    }

    // Focus automatique
    nameRef?.current?.focus();

    // Marquer le composant comme monté
    setIsMounted(true);
    // Au démontage : nettoyer
    return () => {
      clearAll();
      clearStorage();
    };
  }, []); // ✅ Dépendances vides = 1 seule exécution

  // ========================================
  // ⚡ EFFECT 2 : Réinitialiser l'erreur
  // ========================================
  useEffect(() => {
    if (exercises.length > 0 && errorExercises) {
      setErrorExercises("");
    }
  }, [exercises.length, errorExercises, setErrorExercises]);

  // ========================================
  // 📤 RETOUR
  // ========================================
  return {
    // État
    exercises,
    errorExercises,
    isMounted,

    // Actions
    setExercises,
    setErrorExercises,
    clearAll,
    clearStorage,
    handleDeleteExercise,
    // Ref
    nameRef,
  };
}
