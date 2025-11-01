"use client";

import ExerciceSelector from "@/components/Workouts/ExerciceSelector/ExerciceSelector";
import { createPortal } from "react-dom";

export default function SelectExercicesModal({ onClose, onSelectExercise }) {
  return createPortal(
    <div
      onClick={() => onClose()}
      className="fixed bg-black/25 inset-0 flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[300px] rounded"
      >
        <ExerciceSelector
          onSelectExercise={onSelectExercise}
          onClose={onClose}
        />
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
