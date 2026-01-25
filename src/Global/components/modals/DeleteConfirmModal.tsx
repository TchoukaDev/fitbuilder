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
};

// Modale de confirmation de suppression
export default function DeleteConfirmModal({
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  onConfirm,
  isLoading = false,
}: DeleteConfirmModalProps) {
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
          aria-label="Supprimer"
        >
          Supprimer
        </LoaderButton>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
