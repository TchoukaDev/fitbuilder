"use client";

import Button from "@/components/Buttons/Button";
import { useModals } from "@/Context/ModalsContext/ModalContext";
import { useBlockScroll } from "@/hooks/useBlockScroll";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

export default function DeleteConfirmModal({
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  onConfirm,
  isLoading = false,
}) {
  const { closeModal } = useModals();
  useBlockScroll();

  return createPortal(
    <div className="fixed inset-0 bg-black/30flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-accent-600" />
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {/* Boutons */}
        <div className="flex gap-3 justify-center">
          <Button
            close
            onClick={() => closeModal("deleteConfirm")}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
