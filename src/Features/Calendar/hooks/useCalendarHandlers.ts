import { useDeleteSession } from "@/Features/Sessions/hooks/useQuerySessions";
import { useModals } from "@/Providers/Modals";
import { CalendarEvent } from "@/types/calendarEvent";
import { toast } from "react-toastify";


interface UseCalendarHandlersProps {
  userId: string;
  setCurrentDate: (date: Date) => void;
}

export default function useCalendarHandlers({ userId, setCurrentDate }: UseCalendarHandlersProps) {
  const { openModal, closeModal, getModalData, isOpen } = useModals();
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession(
    { userId },
  );

  // Gestion de la date de changement
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  // Ouvrir la modale de création d'événement
  const handleSelectSlot = (slotInfo: { start: Date }) => {
    openModal("newEvent", { userId, selectedDate: slotInfo.start });
  };

  // Ouvrir la modale de détails d'événement
  const handleSelectEvent = (event: CalendarEvent) => {
    openModal("eventDetails", { event });
  };

  // Ouvrir la modale de modification d'événement
  const handleEditEvent = (event: CalendarEvent) => {
    openModal("editEvent", { event });
  };

  // Ouvrir la modale de suppression d'événement
  const handleDeleteEvent = (event: CalendarEvent) => {
    openModal("deleteConfirm", {
      id: event.resource.id,
    });
  };

  // Ouvrir la modale de confirmation de suppression d'événement
  const handleDeleteConfirm = (id: string) => {
    deleteSession(id, {
      onSuccess: () => {
        toast.success("Événement supprimé avec succès");
        closeModal("eventDetails");
        closeModal("deleteConfirm");
      },
      onError: () => {
        toast.error("Erreur lors de la suppression de l'événement");
        closeModal("deleteConfirm");
      },
    });
  };
  return {
    handleDateChange,
    handleSelectSlot,
    handleSelectEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleDeleteConfirm,
    isDeleting,
    openModal,
    closeModal,
    getModalData,
    isOpen,
  };
}
