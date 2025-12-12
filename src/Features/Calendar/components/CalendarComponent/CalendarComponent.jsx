"use client";

import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/fr"; // ✅ Import de la locale française pour moment
import "./calendar.css";
import { Button } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import NewEventModal from "../../modals/NewEventModal";
import { useGetCalendarSessions } from "@/Features/Sessions/hooks";
import { useQueryClient } from "@tanstack/react-query";
import EditEventModal from "../../modals/EditEventModal";

// Configuration de moment en français (dates, jours, mois traduits)
moment.locale("fr");

// Création du localiseur qui permet à react-big-calendar d'utiliser moment pour formater les dates
const localizer = momentLocalizer(moment);

export default function CalendarComponent({ userId, initialSessions = [] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const { isOpen, openModal, getModalData } = useModals();
  const { data: events = [] } = useGetCalendarSessions(userId, null);

  const queryClient = useQueryClient();

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

  // Ouvrir la modale de création d'événement
  const handleSelectSlot = (slotInfo) => {
    openModal("newEvent", { userId, selectedDate: slotInfo.start });
  };

  // Ouvrir la modale de modification d'événement
  const handleSelectEvent = (event) => {
    openModal("editEvent", { event, userId });
  };

  return (
    <>
      <Button
        onClick={() => openModal("newEvent", { userId })}
        onMouseEnter={handlePrefetchWorkouts}
        title="Ajouter un événement"
        label="Ajouter un événement"
      >
        + Ajouter un événement
      </Button>

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
          event={getModalData("editEvent").event}
          userId={getModalData("editEvent").userId}
        />
      )}
      <div className="calendar-container">
        <h1 className="calendar-title">📅 Planning d'entraînement</h1>

        <div className="calendar-wrapper">
          <Calendar
            defaultDate={new Date()} // Date par défaut affichée au chargement (aujourd'hui)
            localizer={localizer} // Système de localisation (gestion des dates avec moment)
            events={events} // Événements à afficher dans le calendrier
            selectable={true}
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
        </div>
      </div>
    </>
  );
}
