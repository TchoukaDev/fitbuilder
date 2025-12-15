"use client";

import { AlertTriangle } from "lucide-react";
import { Button, LoaderButton } from "@/Global/components";
import { useBlockScroll } from "@/Global/hooks";
import { useModals } from "@/Providers/Modals";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";

// Modale d'annulation de la session
export default function CancelSessionModal({
  onConfirm,
  isLoading,
  isPlanned,
}) {
  const { closeModal } = useModals();
  useBlockScroll();

  return createPortal(
    <ModalLayout title="Annuler la séance" modalToClose="cancelSession">
      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-center gap-3 bg-orange-50 p-4 rounded-lg">
          <AlertTriangle className="text-orange-600 shrink-0" size={24} />
          <p>Vous n'avez réalisé aucun exercice.</p>
        </div>

        <p className="text-center">
          {isPlanned
            ? "Voulez-vous annuler cette séance ? Elle sera réinitialisée."
            : "Voulez-vous annuler cette séance ? Elle sera supprimée définitivement."}
        </p>
      </div>
      {/* Footer */}
      <div className="modalFooter">
        <Button
          onClick={() => closeModal("cancelSession")}
          disabled={isLoading}
        >
          Continuer la séance
        </Button>

        <LoaderButton
          isLoading={isLoading}
          loadingText="Annulation en cours"
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          label="Annuler la séance"
          close
        >
          Annuler la séance
        </LoaderButton>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
