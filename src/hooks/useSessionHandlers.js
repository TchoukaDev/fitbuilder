export function useSessionHandlers(
  exercises,
  setExercises,
  setCurrentExerciseIndex,
  saveProgress,
) {
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];

      // Créer le set si non existant
      if (!newExercises[exerciseIndex].actualSets[setIndex]) {
        newExercises[exerciseIndex].actualSets[setIndex] = {
          reps: null,
          weight: newExercises[exerciseIndex].targetWeight || null,
          completed: false,
        };
      }
      // Modifier le set
      newExercises[exerciseIndex].actualSets[setIndex][field] = value;
      return newExercises;
    });
  };

  // Notes de l'exercices
  const handleNotesChange = (exerciseIndex, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].notes = value;
      return newExercises;
    });
  };

  // Effort de l'exercice
  const handleEffortChange = (exerciseIndex, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].effort = value;
      return newExercises;
    });
  };

  // Checkbox set complété
  const handleSetComplete = (exerciseIndex, setIndex) => {
    const currentValue =
      exercises[exerciseIndex].actualSets?.[setIndex]?.completed || false;
    handleSetChange(exerciseIndex, setIndex, "completed", !currentValue); // ✅ Inverse
  };

  // Réouvrir un exercice terminé
  const handleReopenExercise = (exerciseIndex) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].completed = false;
      return newExercises;
    });
    setCurrentExerciseIndex(exerciseIndex);
  };

  // Marquer un exercice comme complété
  const handleExerciseComplete = async (exerciseIndex) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].completed = true;
      return newExercises;
    });

    // Sauvegarder en db
    await saveProgress(exercises);

    // Passer à l'exercice suivant
    if (exerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  };

  return {
    handleSetChange,
    handleNotesChange,
    handleEffortChange,
    handleSetComplete,
    handleReopenExercise,
    handleExerciseComplete,
  };
}
