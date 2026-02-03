import { useSessionStore } from "../store";

/**
 * Marque un exercice comme complété dans le store
 */

interface CompleteExerciseProps {
  exerciseIndex: number;
  handleSaveProgress: () => void;
}
export function completeExercise({ exerciseIndex, handleSaveProgress }: CompleteExerciseProps) {
  const state = useSessionStore.getState();
  const newExercises = [...state.exercises];

// ✅ Pour les séries non complétées, mettre weight et reps à 0
if (newExercises[exerciseIndex].actualSets) {
  newExercises[exerciseIndex].actualSets = newExercises[exerciseIndex].actualSets.map(set => {
    if (!set.completed) {
      return {
        ...set,
        weight: 0,
        reps: 0,
        completed: false
      };
    }
    return set;
  });
}

  newExercises[exerciseIndex].completed = true;

  // Passer à l'exercice suivant si possible
  const nextIndex = exerciseIndex + 1;
  const currentExerciseIndex =
    nextIndex < newExercises.length ? nextIndex : state.currentExerciseIndex;

  // Mettre à jour le store
  state.setExercises(newExercises);
  state.setCurrentExerciseIndex(currentExerciseIndex);

  // Sauvegarder
  handleSaveProgress();
}
