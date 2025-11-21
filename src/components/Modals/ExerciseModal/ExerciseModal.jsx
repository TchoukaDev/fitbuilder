"use client";
import { createPortal } from "react-dom";
import NewExerciceForm from "../../Forms/Exercises/newExerciceForm/newExerciceForm";
import UpdateExerciseForm from "../../Forms/Exercises/UpdateExerciseForm.jsx/UpdateExerciseForm";
import { useBlockScroll } from "@/hooks/useBlockScroll";

export default function ExerciseModal({ update, exerciseToUpdate = null }) {
  useBlockScroll();
  return createPortal(
    <div className="fixed z-100 bg-black/50 inset-0 flex justify-center items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[300px] rounded"
      >
        {/* Modification d'un exercice */}
        {exerciseToUpdate && update ? (
          <>
            <h2>Modifier l'exercice</h2>
            <UpdateExerciseForm exerciseToUpdate={exerciseToUpdate} />
          </>
        ) : (
          <>
            {/* Ajout d'un exercice */}
            <h2>Créer un exercice</h2>
            <NewExerciceForm />
          </>
        )}
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
