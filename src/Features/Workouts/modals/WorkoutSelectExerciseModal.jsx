"use client";

import { useModals } from "@/Providers/ModalContext";
import WorkoutExercisesList from "../components/WorkoutExercisesList/WorkoutExercisesList";
import { useBlockScroll } from "@/Global/hooks/useBlockScroll";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { useState } from "react";

// Modale de selection d'un exercice à ajouter à l'entraînement
export default function WorkoutSelectExerciseModal({
  onSelectExercise,
  favorites,
  allExercises,
  exercisesAdded,
  isAdmin,
  userId,
}) {
  const [title, setTitle] = useState("Ajouter un exercice");

  return createPortal(
    <ModalLayout title={title} modalToClose="workoutSelectExercise">
      <WorkoutExercisesList
        userId={userId}
        isAdmin={isAdmin}
        initialExercises={allExercises}
        initialFavorites={favorites}
        exercisesAdded={exercisesAdded}
        onSelectExercise={onSelectExercise}
        onSetTitle={setTitle}
      />
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
