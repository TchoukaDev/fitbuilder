import { useEffect, useRef } from "react";
import { useWorkoutStore } from "../store";
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
  const exercises = useWorkoutStore((state) => state.exercises);
  const setExercises = useWorkoutStore((state) => state.setExercises);
  const setErrorExercises = useWorkoutStore((state) => state.setErrorExercises);
  const errorExercises = useWorkoutStore((state) => state.errorExercises);
  const isMounted = useWorkoutStore((state) => state.isMounted);
  const setIsMounted = useWorkoutStore((state) => state.setIsMounted);
  const removeExercise = useWorkoutStore((state) => state.removeExercise);

  const loadFromStorageAction = useWorkoutStore(
    (state) => state.loadFromStorage,
  );
  const clearAll = useWorkoutStore((state) => state.clearAll);
  const clearStorage = useWorkoutStore((state) => state.clearStorage);

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
  // ⚡ EFFECT 1 : Montage
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

    // Marquer le composant comme monté
    setIsMounted(true);

    // 🛑 IMPORTANT : Pas de cleanup ici !
    // Le cleanup destructif (clearAll, clearStorage) doit être appelé explicitement
    // par le formulaire parent après soumission réussie, pas au démontage.
    // Cela évite de détruire les données si un composant enfant se démonte prématurément.
  }, []); // ✅ Dépendances vides = 1 seule exécution au montage

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
