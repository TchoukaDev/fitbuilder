"use client";
import { createPortal } from "react-dom";
import NewExerciceForm from "../forms/newExerciceForm/newExerciceForm";
import { useBlockScroll } from "@/Global/hooks/useBlockScroll";
import { X } from "lucide-react";
import { useModals } from "@/Providers/Modals/ModalContext";

// Modal de création d'un nouvel exercice
export default function NewExerciseModal() {
  useBlockScroll();
  const { closeModal } = useModals();
  return createPortal(
    <div className="fixed z-100 bg-black/50 inset-0 flex justify-center items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-blue-50 p-10 min-w-[300px] rounded"
      >
        <button
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          onClick={() => closeModal("newExercise")}
        >
          {" "}
          <X size={24} />
        </button>
        <>
          {/* Ajout d'un exercice */}
          <h2>Créer un exercice</h2>
          <NewExerciceForm />
        </>
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
