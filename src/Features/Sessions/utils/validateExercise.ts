// Valide qu'un exercice est complété (toutes les séries cochées, reps/poids renseignés, effort RPE saisi).
// Retourne { isComplete: boolean, missingFields: object }.

import { SessionExercise } from "@/types/SessionExercise";

type ValidateExerciseProps = {
  exercises: SessionExercise[];
  exerciseIndex: number;
}

export interface MissingFields {
  incompleteSets: string[];
  setsWithoutReps: string[];
  setsWithoutWeight: string[];
  effortMissing: boolean;
}
export function validateExercise({ exercises, exerciseIndex }: ValidateExerciseProps) {
  const exercise = exercises[exerciseIndex];


  const missingFields: MissingFields = {
    incompleteSets: [],
    setsWithoutReps: [],
    setsWithoutWeight: [],
    effortMissing: false,
  };

  // Vérifier chaque série
  exercise.actualSets?.forEach((set, setIndex) => {
    const setNumber = `Série ${setIndex + 1}`;

    // Vérifier si la série est complétée (checkbox)
    if (!set.completed) {
      missingFields.incompleteSets.push(setNumber);
    }

    // Vérifier les reps (accepter 0)
    if (!set.reps) {
      missingFields.setsWithoutReps.push(setNumber);
    }

    // Vérifier le poids (accepter 0)
    if (!set.weight) {
      missingFields.setsWithoutWeight.push(setNumber);
    }
  });

  // Vérifier l'effort (RPE)
  if (!exercise.effort) {
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
