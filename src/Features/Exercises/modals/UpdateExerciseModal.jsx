"use client";
import { createPortal } from "react-dom";
import { UpdateExerciseForm } from "../forms";
import { ModalLayout } from "@/Global/components";

// Modal de modification d'un exercice
export default function UpdateExerciseModal({ exerciseToUpdate = null }) {
  return createPortal(
    <ModalLayout title="Modifier un exercice" modalToClose="updateExercise">
      <UpdateExerciseForm exerciseToUpdate={exerciseToUpdate} />
    </ModalLayout>,

    document.getElementById("portal-root"),
  );
}
