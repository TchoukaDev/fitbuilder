"use client";

import { Button, LoaderButton } from "../ui";
import { ModalLayout } from "../layout";
import { useModals } from "@/Providers/Modals";
import { createPortal } from "react-dom";

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
      <div className="modalFooter">
        <Button
          close
          onClick={() => closeModal("deleteConfirm")}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <LoaderButton
          isLoading={isLoading}
          loadingText="Suppression en cours"
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          label="Supprimer"
        >
          Supprimer
        </LoaderButton>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
