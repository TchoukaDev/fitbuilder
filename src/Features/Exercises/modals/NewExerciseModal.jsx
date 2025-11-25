"use client";
import { createPortal } from "react-dom";
import { NewExerciseForm } from "../forms";
import { ModalLayout } from "@/Global/components";

// Modal de création d'un nouvel exercice
export default function NewExerciseModal() {
  return createPortal(
    <ModalLayout title="Créer un exercice" modalToClose="newExercise">
      <NewExerciseForm />
    </ModalLayout>,

    document.getElementById("portal-root"),
  );
}
