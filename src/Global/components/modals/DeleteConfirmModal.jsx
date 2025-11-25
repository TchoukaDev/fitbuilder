"use client";

import { Button } from "../ui";
import { createPortal } from "react-dom";
import { ModalLayout } from "../layout";
import { useModals } from "@/Providers/Modals";

// Modale de confirmation de suppression
export default function DeleteConfirmModal({
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  onConfirm,
  isLoading = false,
}) {
  const { closeModal } = useModals();
  return createPortal(
    <ModalLayout title={title} modalToClose="deleteConfirm">
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
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
