"use client";

import { useRouter } from "next/navigation";
import { useModals } from "@/Providers/Modals";
import { Button, ModalLayout } from "@/Global/components";
import { useStartPlannedSession } from "@/Features/Sessions/hooks/useQuerySessions";
import { createPortal } from "react-dom";
import StatusBadge from "../components/StatusBadge";
import { Play, Edit, Trash2 } from "lucide-react";
import { CalendarEvent } from "@/types/calendarEvent";

interface EventDetailsModalProps {
  event: CalendarEvent;
  userId: string;
  handleDeleteEvent: (event: CalendarEvent) => void;
  handleEditEvent: (event: CalendarEvent) => void;
  statusFilter: string[];
}
export default function EventDetailsModal({ event, userId, handleDeleteEvent, handleEditEvent, statusFilter }: EventDetailsModalProps) {
  const session = event?.resource; // Données complètes de la session

  const formattedDate = event.start.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const { closeModal } = useModals();
  const router = useRouter();

  const startSession = useStartPlannedSession({ userId }, { statusFilter });

  if (!session) return null;

  // ========================================
  // ACTIONS SELON LE STATUT
  // ========================================

  const handleStart = () => {
    startSession.mutate(session.id, {
      onSuccess: () => {
        closeModal("eventDetails");
        router.push(`/sessions/${session.id}`);
      },
    });
  };

  const handleView = () => {
    closeModal("eventDetails");
    router.push(`/sessions/${session.id}/detail`);
  };

  // ========================================
  // RENDER
  // ========================================

  return createPortal(
    <ModalLayout
      title={`Séance ${event.title} du ${formattedDate}`}
      modalToClose="eventDetails"
    >
      {/* Statut */}

      <div className="mx-auto w-fit mb-10">
        <StatusBadge status={session.status} />
      </div>

      {/* Actions selon statut */}
      <div className="flex justify-center items-center gap-3 mb-10">
        {/* PLANNED : Démarrer, Modifier, Supprimer */}
        {session.status === "planned" && (
          <div className="flex flex-col items-center gap-3">
            <Button edit onClick={() => handleEditEvent(event)}>
              <Edit size={20} />
              Modifier
            </Button>
            <Button close onClick={() => handleDeleteEvent(event)}>
              <Trash2 size={20} />
              Supprimer
            </Button>
            <Button onClick={handleStart} className="btn-primary">
              <Play size={20} />
              Démarrer
            </Button>
          </div>
        )}

        {/* IN-PROGRESS : Reprendre */}
        {session.status === "in-progress" && (
          <Button
            onClick={() => router.push(`/sessions/${session.id}`)}
            className="btn-primary"
          >
            <Play size={20} />
            Reprendre
          </Button>
        )}

        {/* COMPLETED : Voir détails */}
        {session.status === "completed" && (
          <Button onClick={handleView} className="btn-primary">
            Voir le détail
          </Button>
        )}
      </div>
      <div className="modalFooter">
        {/* Fermer la modale */}
        <Button close onClick={() => closeModal("eventDetails")}>
          Fermer
        </Button>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
