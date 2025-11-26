// Regroupe les handlers pour manipuler les exercices en cours d'exécution d'une session.
// (Modifier sets, notes, effort, compléter un set, rouvrir un exercice).
export function sessionExecutionHandlers(
  exercises,
  setExercises,
  setCurrentExerciseIndex,
) {
  // Met à jour un champ d'un set donné (reps, weight, completed)
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

  // Met à jour les notes d'un exercice
  const handleNotesChange = (exerciseIndex, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].notes = value;
      return newExercises;
    });
  };

  // Met à jour l'effort (RPE) d'un exercice
  const handleEffortChange = (exerciseIndex, value) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].effort = value;
      return newExercises;
    });
  };

  // Bascule le statut "complété" d'un set (checkbox)
  const handleSetComplete = (exerciseIndex, setIndex) => {
    const currentValue =
      exercises[exerciseIndex].actualSets?.[setIndex]?.completed || false;
    handleSetChange(exerciseIndex, setIndex, "completed", !currentValue); // ✅ Inverse
  };

  // Rouvre un exercice marqué comme terminé pour le modifier à nouveau
  const handleReopenExercise = (exerciseIndex) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex].completed = false;
      return newExercises;
    });
    setCurrentExerciseIndex(exerciseIndex);
  };

  return {
    handleSetChange,
    handleNotesChange,
    handleEffortChange,
    handleSetComplete,
    handleReopenExercise,
  };
}
