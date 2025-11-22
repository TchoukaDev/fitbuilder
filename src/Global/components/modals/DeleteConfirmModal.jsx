"use client";

import Button from "@/Global/components/ui/Button";
import { useModals } from "@/Providers/Modals/ModalContext";
import { useBlockScroll } from "@/Global/hooks/useBlockScroll";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

// Modale de confirmation de suppression
export default function DeleteConfirmModal({
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  onConfirm,
  isLoading = false,
}) {
  const { closeModal } = useModals();
  useBlockScroll();

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-50 rounded-lg max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-accent-600" />
          </div>
          <button
            className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
            onClick={() => closeModal("deleteConfirm")}
            disabled={isLoading}
          >
            <X size={24} />
          </button>{" "}
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
