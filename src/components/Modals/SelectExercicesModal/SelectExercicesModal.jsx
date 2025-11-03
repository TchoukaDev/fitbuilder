"use client";

import ExercisesList from "@/components/Exercises/ExercisesList/ExercisesList";
import { createPortal } from "react-dom";

export default function SelectExercicesModal({
  onCloseExerciceSelector,
  onSelectExercise,
  favorites,
  allExercises,
  isAdmin,
  userId,
}) {
  return createPortal(
    <div
      onClick={onCloseExerciceSelector}
      className="fixed bg-black/25 inset-0 flex justify-center items-center overflow-scroll"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[300px] rounded"
      >
        <ExercisesList
          userId={userId}
          isAdmin={isAdmin}
          initialExercises={allExercises}
          initialFavorites={favorites}
          inModal={true}
          onSelectExercise={onSelectExercise}
          onCloseExerciceSelector={onCloseExerciceSelector}
        />
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
