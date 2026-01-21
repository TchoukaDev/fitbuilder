import { useDeleteSession } from "@/Features/Sessions/hooks";
import { useModals } from "@/Providers/Modals";
import { toast } from "react-toastify";

export default function useCalendarHandlers(userId, setCurrentDate) {
  const { openModal, closeModal, getModalData, isOpen } = useModals();
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession(
    userId,
    null,
  );

  // Gestion de la date de changement
  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  // Ouvrir la modale de création d'événement
  const handleSelectSlot = (slotInfo) => {
    openModal("newEvent", { userId, selectedDate: slotInfo.start });
  };

  // Ouvrir la modale de détails d'événement
  const handleSelectEvent = (event) => {
    openModal("eventDetails", { event });
  };

  // Ouvrir la modale de modification d'événement
  const handleEditEvent = (event) => {
    openModal("editEvent", { event });
  };

  // Ouvrir la modale de suppression d'événement
  const handleDeleteEvent = (event) => {
    openModal("deleteConfirm", {
      id: event.resource.id,
    });
  };

  // Ouvrir la modale de confirmation de suppression d'événement
  const handleDeleteConfirm = (id) => {
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
    getModalData,
    isOpen,
    openModal,
    closeModal,
    getModalData,
  };
}
