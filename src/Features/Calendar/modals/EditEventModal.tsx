import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { UpdateEventForm } from "../forms";
import { CalendarEvent } from "@/types/calendarEvent";


interface EditEventModalProps {
  userId: string;
  event: CalendarEvent
}

export default function EditEventModal({ userId, event }: EditEventModalProps) {

  const session = event.resource;

  const formattedDate = session?.scheduledDate
    ? new Date(session.scheduledDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return createPortal(
    <ModalLayout
      title={`Modifier l'événement ${session.workoutName} du ${
        formattedDate ? `le ${formattedDate}` : ""
      }`}
      modalToClose="editEvent"
    >
      <UpdateEventForm userId={userId} event={event} />
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
