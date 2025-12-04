"use client";

import WorkoutExercisesList from "../components/WorkoutExercisesList/WorkoutExercisesList";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { useWorkoutFormStore } from "@/Features/Workouts/store/workoutFormStore";

// Modale de selection d'un exercice à ajouter à l'entraînement
export default function WorkoutSelectExerciseModal({
  favoritesExercises,
  allExercises,
  isAdmin,
  userId,
}) {
  const modaleTitle = useWorkoutFormStore((state) => state.modaleTitle);
  return createPortal(
    <ModalLayout title={modaleTitle} modalToClose="workoutSelectExercise">
      <WorkoutExercisesList
        userId={userId}
        isAdmin={isAdmin}
        initialExercises={allExercises}
        initialFavorites={favoritesExercises}
      />
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
