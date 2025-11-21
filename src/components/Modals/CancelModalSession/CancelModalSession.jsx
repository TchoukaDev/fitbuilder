"use client";

import { X, AlertTriangle } from "lucide-react";
import Button from "@/components/Buttons/Button";
import { useBlockScroll } from "@/hooks/useBlockScroll";
import { useModals } from "@/Context/ModalsContext/ModalContext";

export default function CancelSessionModal({ onConfirm, isLoading }) {
  const { closeModal } = useModals();
  useBlockScroll();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        {/* Fermeture */}
        <button
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          onClick={() => closeModal("cancelSession")}
          disabled={isLoading}
        >
          <X size={24} />
        </button>{" "}
        {/* Header */}
        <div className="flex justify-center items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-accent-600">
            Annuler la séance
          </h2>
        </div>
        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-3 bg-orange-50 p-4 rounded-lg">
            <AlertTriangle
              className="text-orange-600 shrink-0 mt-1"
              size={24}
            />
            <p>Vous n'avez réalisé aucun exercice.</p>
          </div>

          <p className="text-center">
            Voulez-vous annuler cette séance ? Elle sera supprimée
            définitivement.
          </p>
        </div>
        {/* Footer */}
        <div className="flex justify-center gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={() => closeModal("cancelSession")}
            disabled={isLoading}
            className="flex-1"
          >
            Continuer la séance
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            close
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Annulation..." : "Annuler la séance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
