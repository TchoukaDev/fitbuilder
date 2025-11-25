"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/Global/components";
import { useBlockScroll } from "@/Global/hooks";
import { useModals } from "@/Providers/Modals";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";

// Modale d'annulation de la session
export default function CancelSessionModal({ onConfirm, isLoading }) {
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
          Voulez-vous annuler cette séance ? Elle sera supprimée définitivement.
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
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
