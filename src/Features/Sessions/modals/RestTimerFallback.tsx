// RestTimerFallback.tsx
import { createPortal } from "react-dom";
import { ModalLayout, Button } from "@/Global/components";
import { useModals } from "@/Providers/Modals/ModalContext";
import { AlertTriangle } from "lucide-react";

export default function RestTimerFallback() {
    const { closeModal } = useModals();
    return createPortal(
        <ModalLayout title="⏱️ Temps de repos" modalToClose="restTimer">
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                <div className="text-6xl"><AlertTriangle className="text-accent-500" size={64} /></div>
                <h2 className="text-xl font-bold text-accent-500">
                    Oups, une erreur s'est produite
                </h2>
                <p className="text-gray-600">
                    Le timer a rencontré un problème.
                </p>
                <Button close className="mt-4" onClick={() => closeModal("restTimer")}>
                    Fermer
                </Button>
            </div>
        </ModalLayout>,
        document.getElementById("portal-root") as HTMLDivElement
    );
}