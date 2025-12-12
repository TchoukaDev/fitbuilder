// components/Modals/EventDetailsModal/EventDetailsModal.jsx

"use client";

import { useRouter } from "next/navigation";
import { useModals } from "@/Providers/Modals";
import { Button, ModalLayout } from "@/Global/components";
import {
  useStartPlannedSession,
  useDeleteSession,
} from "@/Features/Sessions/hooks";
import { createPortal } from "react-dom";
import StatusBadge from "../components/CalendarComponent/StatusBadge";

export default function EditEventModal({ event, userId }) {
  const session = event?.resource; // Données complètes de la session
  const formattedDate = event.start.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const { closeModal, openModal } = useModals();
  const router = useRouter();

  const startSession = useStartPlannedSession(userId);
  const deleteSession = useDeleteSession(userId);

  if (!session) return null;

  // ========================================
  // ACTIONS SELON LE STATUT
  // ========================================

  const handleStart = () => {
    startSession.mutate(session._id, {
      onSuccess: () => {
        closeModal("eventDetails");
        router.push(`/sessions/${session._id}`);
      },
    });
  };

  const handleEdit = () => {
    closeModal("eventDetails");
    openModal("editEvent", { event });
  };

  const handleDelete = () => {
    if (window.confirm("Supprimer cette séance ?")) {
      deleteSession.mutate(session._id, {
        onSuccess: () => {
          closeModal("eventDetails");
        },
      });
    }
  };

  const handleView = () => {
    closeModal("eventDetails");
    router.push(`/sessions/${session._id}/detail`);
  };

  // ========================================
  // RENDER
  // ========================================

  return createPortal(
    <ModalLayout
      title={`Évènement ${event.title} du ${formattedDate}`}
      modalToClose="editEvent"
    >
      {/* Infos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Statut :</span>
          <StatusBadge status={session.status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Durée estimée :</span>
          <span>{session.estimatedDuration} min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Exercices :</span>
          <span>{session.exercises?.length || 0}</span>
        </div>
      </div>

      {/* Actions selon statut */}
      <div className="flex gap-3 justify-end">
        <Button close onClick={() => closeModal("eventDetails")}>
          Fermer
        </Button>

        {/* PLANNED : Démarrer, Modifier, Supprimer */}
        {session.status === "planned" && (
          <>
            <Button onClick={handleEdit} className="btn-secondary">
              Modifier
            </Button>
            <Button onClick={handleDelete} className="btn-danger">
              Supprimer
            </Button>
            <Button onClick={handleStart} className="btn-primary">
              Démarrer
            </Button>
          </>
        )}

        {/* IN-PROGRESS : Reprendre */}
        {session.status === "in-progress" && (
          <Button
            onClick={() => router.push(`/sessions/${session._id}`)}
            className="btn-primary"
          >
            Reprendre
          </Button>
        )}

        {/* COMPLETED : Voir détails */}
        {session.status === "completed" && (
          <Button onClick={handleView} className="btn-primary">
            Voir la séance
          </Button>
        )}
      </div>
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
