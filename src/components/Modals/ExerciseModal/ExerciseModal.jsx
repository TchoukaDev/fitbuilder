"use client";
import { createPortal } from "react-dom";
import NewExerciceForm from "../../Forms/Exercises/newExerciceForm/newExerciceForm";
import UpdateExerciseForm from "../../Forms/Exercises/UpdateExerciseForm.jsx/UpdateExerciseForm";

export default function ExerciseModal({
  onClose,
  onExerciseAdded = null,
  onExerciseUpdated = null,
  exerciseToUpdate = null,
}) {
  return createPortal(
    <div
      onClick={() => onClose()}
      className="fixed bg-black/25 inset-0 flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[300px] rounded"
      >
        {/* Ajout d'un exercice */}
        {onExerciseAdded && (
          <>
            <h2 className="text-center font-semibold mb-5 text-xl">
              Créer un exercice
            </h2>
            <NewExerciceForm
              onClose={onClose}
              onExerciseAdded={onExerciseAdded}
            />
          </>
        )}{" "}
        {/* Modification d'un exercice */}
        {onExerciseUpdated && exerciseToUpdate && (
          <>
            <h2 className="text-center font-semibold mb-5 text-xl">
              Modifier l'exercice
            </h2>
            <UpdateExerciseForm
              onClose={onClose}
              onExerciseUpdated={onExerciseUpdated}
              exerciseToUpdate={exerciseToUpdate}
            />
          </>
        )}
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
