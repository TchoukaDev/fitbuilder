import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { NewEventForm } from "../forms";

export default function NewEventModal({ userId, selectedDate = null }) {
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  return createPortal(
    <ModalLayout
      title={`Nouvel événement ${formattedDate ? `le ${formattedDate}` : ""}`}
      modalToClose="newEvent"
    >
      <NewEventForm userId={userId} selectedDate={selectedDate} />
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
