"use client";

import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { WorkoutExerciseConfigurator } from "../components";

// Modale de selection d'un exercice à ajouter à l'entraînement
export default function WorkoutSelectExerciseModal({
  favoritesExercises,
  allExercises,
  isAdmin,
  userId,
}) {
  const modaleTitle = useWorkoutStore((state) => state.modaleTitle);
  return createPortal(
    <ModalLayout title={modaleTitle} modalToClose="workoutSelectExercise">
      <WorkoutExerciseConfigurator
        userId={userId}
        isAdmin={isAdmin}
        initialExercises={allExercises}
        initialFavorites={favoritesExercises}
      />
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
