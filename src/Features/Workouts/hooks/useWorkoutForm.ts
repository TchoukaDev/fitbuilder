import { useEffect, useRef } from "react";
import { useWorkoutStore } from "../store";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "@/types/workoutExercise";

/**
 * Hook custom pour gérer la logique commune des formulaires de workout
 */
interface useWorkoutFormProps {
  initialExercises?: WorkoutExercise[],
  loadFromStorage: boolean
}

export function useWorkoutForm({
  initialExercises = [],
  loadFromStorage = false,
}: useWorkoutFormProps) {
  const { closeModal, getModalData } = useModals();
  const router = useRouter();
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
    const index = getModalData<{ index: number }>("deleteConfirm")?.index ?? 0;
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


  // Fonction pour quitter l'éditeur et nettoyer les données
  const handleRouterBack = () => {
    clearAll();
    clearStorage();
    setExercises([]);
    closeModal("confirmRouterBack");
    router.refresh();
    router.back();
  }

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
    handleRouterBack,
    // Ref
    nameRef,
  };
}
