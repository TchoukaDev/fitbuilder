"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/fr";
import "./calendar.css";
import { Button, DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { useCancelPlannedSession } from "@/Features/Sessions/hooks/useQuerySessions";
import {
  useCalendarStates,
  useCalendarHandlers,
  useMemoCalendar,
} from "../hooks";
import { NewEventModal, EditEventModal, EventDetailsModal } from "../modals";
import { useGetCalendarSessions } from "@/Features/Sessions/hooks/useQuerySessions";
import { StatusFilter } from "@/Features/Calendar/components";
import { useWorkouts } from "@/Features/Workouts/hooks";
import { ClipLoader } from "react-spinners";
import { CalendarEvent } from "@/types/calendarEvent";

// Configuration de moment en français (dates, jours, mois traduits)
moment.locale("fr");

// Création du localiseur qui permet à react-big-calendar d'utiliser moment pour formater les dates
const localizer = momentLocalizer(moment);

interface CalendarComponentProps {
  userId: string;
  initialEvents: CalendarEvent[];
}

export default function CalendarComponent({ userId, initialEvents }: CalendarComponentProps) {
  // 📅 STATES
  const {
    isMobile,
    currentView,
    setCurrentView,
    statusFilter,
    setStatusFilter,
    currentDate,
    setCurrentDate,
  } = useCalendarStates();

  // Reformater les dates pour le calendrier
  const hydratedInitialEvents = initialEvents?.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
  // 📅 QUERIES
  const { data: events = [], isLoading: isLoadingEvents } =
    useGetCalendarSessions(hydratedInitialEvents, userId, null);

  // 📅 PREFETCH
  const { prefetchWorkouts } = useWorkouts({ userId });

  // 📅 CONSTANTES
  const message = "Êtes-vous sûr de vouloir supprimer cet événement ?";
  const title = "Supprimer l'événement";

  // 📅 MEMO
  const { formats, views, filteredEvents, eventPropGetter, messages } =
    useMemoCalendar({ isMobile, events, statusFilter });

  // 📅 HANDLERS
  const {
    handleDateChange,
    handleSelectSlot,
    handleSelectEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleDeleteConfirm,
    isDeleting,
    openModal,
    getModalData,
    isOpen,
  } = useCalendarHandlers({ userId, setCurrentDate });

  const { closeModal } = useModals();
  const cancelInProgress = useCancelPlannedSession(userId);

  return (
    <>
      {" "}
      <div className="calendar-container">
        {" "}
        <div className="mb-3 flex flex-col sm:flex-row items-center gap-8 justify-between">
          <Button
            onClick={() => openModal("newEvent", { userId })}
            onMouseEnter={prefetchWorkouts}
            title="Ajouter un événement"
            aria-label="Ajouter un événement"
          >
            + Ajouter un événement
          </Button>{" "}
          <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
        </div>
        {/* Modale de création d'événement */}
        {isOpen("newEvent") && (
          <NewEventModal
            userId={getModalData<{ userId: string }>("newEvent")!.userId}
            selectedDate={getModalData<{ selectedDate: Date }>("newEvent")?.selectedDate ?? null}
          />
        )}
        {/* Modale de modification d'événement */}
        {isOpen("editEvent") && (
          <EditEventModal
            userId={userId}
            event={getModalData<{ event: CalendarEvent }>("editEvent")!.event}
          />
        )}
        {/* Modale de détails d'événement */}
        {isOpen("eventDetails") && (
          <EventDetailsModal
            event={getModalData<{ event: CalendarEvent }>("eventDetails")!.event}
            userId={userId}
            handleDeleteEvent={handleDeleteEvent}
            handleEditEvent={handleEditEvent}
          />
        )}
        {/* Modale de confirmation de suppression */}
        {isOpen("deleteConfirm") && (
          <DeleteConfirmModal
            onConfirm={() =>
              handleDeleteConfirm(getModalData<{ id: string }>("deleteConfirm")!.id)
            }
            isLoading={isDeleting}
            message={message}
            title={title}
          />
        )}
        {/* Modale de confirmation d'annulation d'une séance en cours */}
        {isOpen("cancelInProgressSession") && (
          <DeleteConfirmModal
            title="Annuler la séance en cours"
            message="Les données de la séance (exercices effectués, séries) seront réinitialisées. La séance repassera au statut Planifiée."
            confirmMessage="Annuler la séance"
            cancelMessage="Continuer"
            modalToClose="cancelInProgressSession"
            onConfirm={() => {
              const { sessionId } = getModalData<{ sessionId: string }>("cancelInProgressSession")!;
              cancelInProgress.mutate(sessionId, {
                onSuccess: () => {
                  closeModal("cancelInProgressSession");
                  closeModal("eventDetails");
                },
              });
            }}
            isLoading={cancelInProgress.isPending}
          />
        )}
        <div className="calendar-wrapper" onMouseEnter={prefetchWorkouts}>
          {isLoadingEvents ? (
            <div className="animate-pulse w-full h-full flex items-center justify-center">
              <ClipLoader size={60} color="#7557ff" />
              <span className="text-2xl">Chargement du calendrier...</span>
            </div>
          ) : (
            <Calendar
              date={currentDate} // Date par défaut affichée au chargement (aujourd'hui)
              localizer={localizer} // Système de localisation (gestion des dates avec moment)
              events={filteredEvents} // Événements à afficher dans le calendrier
              selectable={true}
              onNavigate={handleDateChange}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              startAccessor="start" // Clé pour accéder à la date de début dans les objets événements
              endAccessor="end" // Clé pour accéder à la date de fin dans les objets événements
              view={currentView} // Vue actuellement affichée (contrôlée par l'état)
              onView={setCurrentView} // Callback appelé quand l'utilisateur change de vue (met à jour l'état)
              views={views}
              formats={formats} // Objet de formats personnalisés défini plus haut
              style={{ height: "100%" }}
              messages={messages}
              eventPropGetter={eventPropGetter}
              min={new Date(2024, 0, 1, 7, 0, 0)}
              max={new Date(2024, 0, 1, 21, 0, 0)} // 20h
              length={30} // Nombre de jours affichés dans la vue Agenda (30 jours à partir d'aujourd'hui)
            />
          )}
        </div>
      </div>
    </>
  );
}
