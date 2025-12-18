import { Button, LoaderButton } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";
import { useStartPlannedSession } from "../hooks";
import { useBlockScroll } from "@/Global/hooks";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";

export default function StartOrContinueConfirmModal({
  action,
  session,
  userId,
}) {
  const { closeModal } = useModals();
  const { mutate: startPlannedSession, isPending: isStarting } =
    useStartPlannedSession(userId);
  useBlockScroll();
  const router = useRouter();

  const handleStartOrContinue = () => {
    if (action === "start") {
      startPlannedSession(session._id, {
        onSuccess: () => {
          router.push(`/sessions/${session._id}`);
          closeModal("startOrContinueSession");
        },
        onError: (error) => {
          toast.error(error.message || "Erreur lors du démarrage de la séance");
        },
      });
    } else {
      router.push(`/sessions/${session._id}`);
      closeModal("startOrContinueSession");
    }
  };

  return createPortal(
    <ModalLayout
      title={action === "start" ? "Démarrer la séance" : "Continuer la séance"}
      modalToClose="startOrContinueSession"
    >
      <div className="p-6 space-y-4">
        <p className="text-center text-gray-600">
          {action === "start"
            ? "Voulez-vous démarrer cette séance ?"
            : "Voulez-vous continuer cette séance ?"}
        </p>
      </div>
      <div className="modalFooter">
        <Button close onClick={() => closeModal("startOrContinueSession")}>
          Annuler
        </Button>
        <LoaderButton
          isLoading={isStarting}
          loadingText={
            action === "start" ? "Démarrage en cours" : "Reprise en cours"
          }
          type="button"
          label={action === "start" ? "Démarrer" : "Continuer"}
          onClick={handleStartOrContinue}
        >
          {action === "start" ? "Démarrer" : "Continuer"}
        </LoaderButton>
      </div>
    </ModalLayout>,
    document.body,
  );
}
