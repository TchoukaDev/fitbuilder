"use client";
import { createPortal } from "react-dom";
import { UpdateExerciseForm } from "../forms";
import { useBlockScroll } from "@/Global/hooks/useBlockScroll";
import { X } from "lucide-react";
import { useModals } from "@/Providers/Modals/ModalContext";

// Modal de modification d'un exercice
export default function UpdateExerciseModal({ exerciseToUpdate = null }) {
  useBlockScroll();
  const { closeModal } = useModals();
  return createPortal(
    <div className="fixed z-100 bg-black/50 inset-0 flex justify-center items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-primary-50 p-10 min-w-[300px] rounded"
      >
        <button
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          onClick={() => closeModal("updateExercise")}
        >
          {" "}
          <X size={24} />
        </button>
        <h2>Modifier l'exercice</h2>
        <UpdateExerciseForm exerciseToUpdate={exerciseToUpdate} />
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
