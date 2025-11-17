"use client";

import ExercisesList from "@/app/Features/Exercises/ExercisesList/ExercisesList";
import { useBlockScroll } from "@/hooks/useBlockScroll";
import { X } from "lucide-react";
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
  useBlockScroll();

  return createPortal(
    <div className="fixed bg-black/50 inset-0 p-4 flex justify-center overflow-scroll">
      <div className="relative bg-blue-50 p-10 min-w-[400px] m-auto rounded">
        {/* Fermeture */}
        <button
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          onClick={onCloseExerciseSelector}
        >
          <X size={24} />
        </button>{" "}
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
