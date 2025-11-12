"use client";
import { createPortal } from "react-dom";
import NewExerciceForm from "../../Forms/Exercises/newExerciceForm/newExerciceForm";
import UpdateExerciseForm from "../../Forms/Exercises/UpdateExerciseForm.jsx/UpdateExerciseForm";

export default function ExerciseModal({ onClose, exerciseToUpdate = null }) {
  return createPortal(
    <div
      onClick={() => onClose()}
      className="fixed bg-black/50 inset-0 flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[300px] rounded"
      >
        {/* Modification d'un exercice */}
        {exerciseToUpdate ? (
          <>
            <h2>Modifier l'exercice</h2>
            <UpdateExerciseForm
              onClose={onClose}
              exerciseToUpdate={exerciseToUpdate}
            />
          </>
        ) : (
          <>
            {/* Ajout d'un exercice */}
            <h2>Créer un exercice</h2>
            <NewExerciceForm onClose={onClose} />
          </>
        )}
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
