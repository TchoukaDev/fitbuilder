import { Button, LoaderButton } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";
import {
  useDeleteSession,
  useStartPlannedSession,
  useCancelPlannedSession,
} from "../hooks/useQuerySessions";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { Trash2, X, Play } from "lucide-react";
import { WorkoutSession } from "@/types/workoutSession";
import { ApiErrorType } from "@/libs/apiResponse";

interface StartOrContinueConfirmModalProps {
  action: "start" | "continue";
  session: WorkoutSession;
  userId: string;
}


export default function StartOrContinueConfirmModal({
  action,
  session,
  userId,
}: StartOrContinueConfirmModalProps) {
  const { closeModal } = useModals();
  const { mutate: startPlannedSession, isPending: isStarting } =
    useStartPlannedSession(userId);
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeleteSession({ userId, statusFilter: null });
  const { mutate: cancelSession, isPending: isCancelling } =
    useCancelPlannedSession(userId);
  const router = useRouter();

  const handleStartOrContinue = () => {
    if (action === "start") {
      startPlannedSession(session.id, {
        onSuccess: () => {
          router.push(`/sessions/${session.id}`);
          closeModal("startOrContinueSession");
        },
        onError: (error: ApiErrorType) => {
          toast.error(error.message || error.error || "Erreur lors du démarrage de la séance");
        },
      });
    } else {
      router.push(`/sessions/${session.id}`);
      closeModal("startOrContinueSession");
    }
  };

  const handleDeleteOrCancel = () => {
    if (action === "start") {
      deleteSession(session.id, {
        onSuccess: () => {
          toast.success("Séance supprimée avec succès");
          closeModal("startOrContinueSession");
        },
        onError: (error: Error) => {
          toast.error(
            error.message || "Erreur lors de la suppression de la séance",
          );
        },
      });
    } else {
      cancelSession(session.id, {
        onSuccess: () => {
          closeModal("startOrContinueSession");
        },
        onError: (error: ApiErrorType) => {
          toast.error(
            error.message || "Erreur lors de l'annulation de la séance",
          );
        },
      });
    }
  };

  return createPortal(
    <ModalLayout
      title={action === "start" ? "Démarrer la séance" : "Reprendre la séance"}
      modalToClose="startOrContinueSession"
    >
      <div className="p-6 space-y-4">
        <p className="text-center text-gray-600 mb-10">
          Que souhaitez-vous faire ?
        </p>
        <div className="flex flex-col items-center gap-2">
          {/* Bouton de démarrage ou de reprise */}
          <LoaderButton
            isLoading={isStarting}
            loadingText={`${action === "start" ? "Démarrage" : "Reprise"
              } en cours`}
            type="button"
            aria-label={action === "start" ? "Démarrer" : "Reprendre"}
            onClick={handleStartOrContinue}
          >
            {" "}
            <Play size={20} />
            {action === "start" ? "Démarrer la séance" : "Reprendre la séance"}
          </LoaderButton>

          {/* Bouton de suppression ou d'annulation */}
          <LoaderButton
            close
            isLoading={action === "start" ? isDeleting : isCancelling}
            loadingText={`${action === "start" ? "Suppression" : "Annulation"
              } en cours`}
            type="button"
            aria-label={
              action === "start" ? " Supprimer la séance" : "Annuler la séance"
            }
            onClick={handleDeleteOrCancel}
          >
            {action === "start" ? (
              <>
                <Trash2 size={20} /> Supprimer la séance
              </>
            ) : (
              <>
                <X size={20} /> Annuler la séance
              </>
            )}
          </LoaderButton>
        </div>
      </div>
      <div className="modalFooter">
        <Button close onClick={() => closeModal("startOrContinueSession")}>
          Fermer
        </Button>
      </div>
    </ModalLayout>,
    document.body,
  );
}
