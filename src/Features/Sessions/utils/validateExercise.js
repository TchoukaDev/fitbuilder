export function validateExercise(exercises, exerciseIndex) {
  const exercise = exercises[exerciseIndex];
  const missingFields = {
    incompleteSets: [],
    setsWithoutReps: [],
    setsWithoutWeight: [],
    effortMissing: false,
  };

  // Vérifier chaque série
  exercise.actualSets?.forEach((set, setIndex) => {
    const setNumber = `Série ${setIndex + 1}`;
    console.log(set.reps);
    // Vérifier si la série est complétée (checkbox)
    if (!set.completed) {
      missingFields.incompleteSets.push(setNumber);
    }

    // Vérifier les reps (accepter 0)
    if (set.reps === null || set.reps === undefined || set.reps === "") {
      missingFields.setsWithoutReps.push(setNumber);
    }

    // Vérifier le poids (accepter 0)
    if (set.weight === null || set.weight === undefined || set.weight === "") {
      missingFields.setsWithoutWeight.push(setNumber);
    }
  });

  // Vérifier l'effort (RPE)
  if (
    exercise.effort === null ||
    exercise.effort === undefined ||
    exercise.effort === false
  ) {
    missingFields.effortMissing = true;
  }

  // Retourner true si tout est OK, sinon retourner les champs manquants
  const isComplete =
    missingFields.incompleteSets.length === 0 &&
    missingFields.setsWithoutReps.length === 0 &&
    missingFields.setsWithoutWeight.length === 0 &&
    !missingFields.effortMissing;

  return {
    isComplete,
    missingFields,
  };
}
