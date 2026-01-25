"use client";

import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { WorkoutExerciseConfigurator } from "../components";
import { Exercise } from "@/types/exercise";

// Modale de selection d'un exercice à ajouter à l'entraînement

interface WorkoutSelectExerciseModalProps {
  favoritesExercises: string[]
  allExercises: Exercise[]
  isAdmin: boolean
  userId: string
}

export default function WorkoutSelectExerciseModal({
  favoritesExercises,
  allExercises,
  isAdmin,
  userId,
}: WorkoutSelectExerciseModalProps) {

  const modaleTitle = useWorkoutStore((state) => state.modaleTitle);
  const setStepAction = useWorkoutStore((state) => state.setStep);
  const clearAll = useWorkoutStore((state) => state.clearAll)
  return createPortal(
    <ModalLayout title={modaleTitle} modalToClose="workoutSelectExercise" option={() => {
      setStepAction(1);
      clearAll();
    }}>
      <WorkoutExerciseConfigurator
        initialExercises={allExercises}
        initialFavorites={favoritesExercises}
        isAdmin={isAdmin}
        userId={userId}
      />
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
