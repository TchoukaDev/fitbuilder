"use client";
import { createPortal } from "react-dom";
import { UpdateExerciseForm } from "../forms";
import { ModalLayout } from "@/Global/components";
import { Exercise } from "@/types/exercise";

// Modal de modification d'un exercice

export default function UpdateExerciseModal({
  exerciseToUpdate,
}: {
  exerciseToUpdate: Exercise | undefined;
}) {
  if (!exerciseToUpdate) return null;

  return createPortal(
    <ModalLayout title="Modifier un exercice" modalToClose="updateExercise">
      <UpdateExerciseForm exerciseToUpdate={exerciseToUpdate} />
    </ModalLayout>,

    document.getElementById("portal-root") as HTMLDivElement,
  );
}
