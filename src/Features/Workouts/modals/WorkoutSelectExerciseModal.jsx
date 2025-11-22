"use client";

import { useModals } from "@/Providers/Modals/ModalContext";
import WorkoutExercisesList from "../components/WorkoutExercisesList/WorkoutExercisesList";
import { useBlockScroll } from "@/Global/hooks/useBlockScroll";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

// Modale de selection d'un exercice à ajouter à l'entraînement
export default function WorkoutSelectExerciseModal({
  onSelectExercise,
  favorites,
  allExercises,
  exercisesAdded,
  isAdmin,
  userId,
}) {
  const { closeModal } = useModals();
  useBlockScroll();

  return createPortal(
    <div className="fixed bg-black/30 inset-0 p-4 flex justify-center overflow-scroll z-50">
      <div className="relative bg-white p-10 min-w-[400px] m-auto rounded">
        {/* Fermeture */}
        <button
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          onClick={() => closeModal("workoutSelectExercise")}
        >
          <X size={24} />
        </button>{" "}
        <WorkoutExercisesList
          userId={userId}
          isAdmin={isAdmin}
          initialExercises={allExercises}
          initialFavorites={favorites}
          exercisesAdded={exercisesAdded}
          onSelectExercise={onSelectExercise}
        />
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
