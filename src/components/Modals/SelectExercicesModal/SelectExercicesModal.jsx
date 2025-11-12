"use client";

import ExercisesList from "@/components/Features/Exercises/ExercisesList/ExercisesList";
import { createPortal } from "react-dom";

export default function SelectExercicesModal({
  onCloseExerciseSelector,
  onSelectExercise,
  favorites,
  allExercises,
  exercisesAdded,
  isAdmin,
  userId,
}) {
  return createPortal(
    <div
      onClick={onCloseExerciseSelector}
      className="fixed bg-black/50 inset-0 flex justify-center items-center overflow-scroll"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[400px] rounded"
      >
        <ExercisesList
          userId={userId}
          isAdmin={isAdmin}
          initialExercises={allExercises}
          initialFavorites={favorites}
          exercisesAdded={exercisesAdded}
          inModal={true}
          onSelectExercise={onSelectExercise}
          onCloseExerciseSelector={onCloseExerciseSelector}
        />
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
