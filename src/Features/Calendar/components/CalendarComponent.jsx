"use client";

import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/fr"; // ✅ Import de la locale française pour moment
import "./calendar.css";
import { Button, DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import NewEventModal from "../modals/NewEventModal";
import {
  useGetCalendarSessions,
  useDeleteSession,
} from "@/Features/Sessions/hooks";
import { useQueryClient } from "@tanstack/react-query";
import EventDetailsModal from "../modals/EventDetailsModal";
import { toast } from "react-toastify";
import EditEventModal from "../modals/EditEventModal";
import { ClipLoader } from "react-spinners";
import { StatusFilter, CustomToolbar } from "@/Features/Calendar/components";

// Configuration de moment en français (dates, jours, mois traduits)
moment.locale("fr");

// Création du localiseur qui permet à react-big-calendar d'utiliser moment pour formater les dates
const localizer = momentLocalizer(moment);

export default function CalendarComponent({ userId, initialSessions = [] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [statusFilter, setStatusFilter] = useState(["all"]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { isOpen, openModal, getModalData, closeModal } = useModals();
  const { data: events = [], isLoading: isLoadingEvents } =
    useGetCalendarSessions(userId, null);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession(
    userId,
    null,
  );

  const queryClient = useQueryClient();
  const message = "Êtes-vous sûr de vouloir supprimer cet événement ?";
  const title = "Supprimer l'événement";

  // 📱 DÉTECTION DE LA TAILLE D'ÉCRAN

  useEffect(() => {
    // Fonction qui vérifie si la largeur d'écran est < 768px
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // true si mobile, false sinon
      setIsMobile(mobile); // Met à jour l'état mobile

      // Si on passe en mode mobile ET qu'on est en vue MONTH, basculer automatiquement en AGENDA
      // (car la vue mois est moins lisible sur mobile)
      if (mobile && currentView === Views.MONTH) {
        setCurrentView(Views.AGENDA);
      }
    };

    // Vérifier la taille au montage du composant
    checkMobile();

    // Ajouter un écouteur d'événement qui vérifie à chaque redimensionnement de fenêtre
    window.addEventListener("resize", checkMobile);

    // Fonction de nettoyage : retirer l'écouteur quand le composant est démonté
    // (évite les fuites mémoire)
    return () => window.removeEventListener("resize", checkMobile);
  }, [currentView]); // ⚠️ Re-exécuter l'effet si currentView change

  // ========================================
  // 📅 FORMATS PERSONNALISÉS (AGENDA)
  // ========================================
  // Ces formats définissent comment les dates et heures sont affichées dans la vue AGENDA
  const formats = {
    // Format de la colonne "Date" dans l'agenda
    // Mobile : "25/12" | Desktop : "lun 25 déc"
    agendaDateFormat: (date) => {
      return isMobile
        ? moment(date).format("DD/MM") // Format court pour mobile
        : moment(date).format("ddd DD MMM"); // Format long avec jour de la semaine pour desktop
    },

    // Format de l'heure dans la colonne "Heure" (ex: "14:30")
    agendaTimeFormat: "HH:mm",

    // Format de la plage horaire complète (ex: "14:30 - 16:00")
    agendaTimeRangeFormat: ({ start, end }) => {
      return `${moment(start).format("HH:mm")} - ${moment(end).format(
        "HH:mm",
      )}`;
    },
  };

  // ✅ Filtrer les événements affichés selon la sélection
  const filteredEvents = statusFilter.includes("all")
    ? events
    : events?.filter((event) =>
        statusFilter.includes(event?.resource?.status),
      ) || [];

  // ✅ Prefetch au survol du bouton
  const handlePrefetchWorkouts = () => {
    queryClient.prefetchQuery({
      queryKey: ["workouts", userId],
      queryFn: async () => {
        const response = await fetch("/api/workouts");
        const data = await response.json();
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };

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

  // Ouvrir la modale de suppression d'événement
  const handleDeleteEvent = (event) => {
    openModal("deleteConfirm", {
      id: event.resource._id,
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

  // Ouvrir la modale de modification d'événement
  const handleEditEvent = (event) => {
    openModal("editEvent", { event });
  };

  return (
    <>
      {" "}
      <div className="calendar-container">
        {" "}
        <h1>📅 Planning d'entraînement</h1>
        <div className="mb-3 flex items-center justify-between">
          <Button
            onClick={() => openModal("newEvent", { userId })}
            onMouseEnter={handlePrefetchWorkouts}
            title="Ajouter un événement"
            label="Ajouter un événement"
          >
            + Ajouter un événement
          </Button>{" "}
          <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
        </div>
        {/* Modale de création d'événement */}
        {isOpen("newEvent") && (
          <NewEventModal
            userId={getModalData("newEvent").userId}
            selectedDate={getModalData("newEvent").selectedDate}
          />
        )}
        {/* Modale de modification d'événement */}
        {isOpen("editEvent") && (
          <EditEventModal
            userId={userId}
            event={getModalData("editEvent").event}
          />
        )}
        {/* Modale de détails d'événement */}
        {isOpen("eventDetails") && (
          <EventDetailsModal
            event={getModalData("eventDetails").event}
            userId={userId}
            handleDeleteEvent={handleDeleteEvent}
            handleEditEvent={handleEditEvent}
          />
        )}
        {/* Modale de confirmation de suppression */}
        {isOpen("deleteConfirm") && (
          <DeleteConfirmModal
            onConfirm={() =>
              handleDeleteConfirm(getModalData("deleteConfirm").id)
            }
            isLoading={isDeleting}
            message={message}
            title={title}
          />
        )}
        <div className="calendar-wrapper">
          {isLoadingEvents ? (
            <div className="animate-pulse h-full w-full flex items-center justify-center gap-4">
              <ClipLoader size={60} color="#7557ff" />
              <span className="text-2xl">Chargement des événements...</span>
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
              views={
                isMobile
                  ? [Views.AGENDA, Views.DAY] // Sur mobile : seulement Agenda et Jour (plus adaptées)
                  : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA] // Sur desktop : toutes les vues
              }
              formats={formats} // Objet de formats personnalisés défini plus haut
              style={{ height: "100%" }}
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
                date: "Date",
                time: "Heure",
                event: "Événement",
                noEventsInRange: "Aucun événement dans cette période",
              }}
              components={{
                toolbar: CustomToolbar,
              }}
              eventPropGetter={(event) => ({
                style: {
                  "--event-color": event.color,
                  "--event-color-hover": event.colorHover,
                }, // Permet de définir une couleur personnalisée par événement
              })}
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
