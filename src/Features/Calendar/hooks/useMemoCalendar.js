import { useMemo, useCallback } from "react";
import { Views } from "react-big-calendar";
import moment from "moment";

export default function useMemoCalendar(isMobile, events, statusFilter) {
  // Formats personnalisés pour la vue Agenda
  const formats = useMemo(
    () => ({
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
    }),
    [isMobile],
  );

  const views = useMemo(
    () =>
      isMobile
        ? [Views.AGENDA, Views.DAY] // Sur mobile : seulement Agenda et Jour (plus adaptées)
        : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA], // Sur desktop : toutes les vues
    [isMobile],
  );

  // ✅ Filtrer les événements affichés selon la sélection
  const filteredEvents = useMemo(
    () =>
      statusFilter.includes("all")
        ? events
        : events?.filter((event) =>
            statusFilter.includes(event?.resource?.status),
          ) || [],
    [events, statusFilter],
  );

  const messages = useMemo(
    () => ({
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
    }),
    [],
  );

  const eventPropGetter = useCallback(
    (event) => ({
      style: {
        "--event-color": event.color,
        "--event-color-hover": event.colorHover,
      },
    }),
    [],
  );
  return { formats, views, filteredEvents, eventPropGetter, messages };
}
