"use client";

import { Button, LoaderButton } from "../ui";
import { ModalLayout } from "../layout";
import { useModals } from "@/Providers/Modals";
import { createPortal } from "react-dom";

type DeleteConfirmModalProps = {
  title?: string;
  message?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmMessage?: string;
  cancelMessage?: string;
  modalToClose?: string;
};

// Modale de confirmation de suppression
export default function DeleteConfirmModal({
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  confirmMessage = "Supprimer",
  cancelMessage = "Annuler",
  modalToClose = "deleteConfirm",
  onConfirm,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const { closeModal } = useModals();
  return createPortal(
    <ModalLayout title={title} modalToClose={modalToClose}>
      {/* Message */}
      <p className="text-center text-gray-600 mb-6">{message}</p>

      {/* Boutons */}
      <div className="modalFooter">
        <Button
          close
          onClick={() => closeModal(modalToClose)}
          disabled={isLoading}
        >
          {cancelMessage}
        </Button>
        <LoaderButton
          isLoading={isLoading}
          loadingText="Suppression en cours"
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          aria-label="Supprimer"
        >
          {confirmMessage}
        </LoaderButton>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
