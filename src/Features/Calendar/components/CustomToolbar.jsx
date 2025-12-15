"use client";

import { Button } from "@/Global/components/ui";
import moment from "moment";

export default function CustomToolbar({
  date,
  view,
  onNavigate,
  onView,
  views,
}) {
  // Fonction pour formater le titre selon la vue
  const getTitle = () => {
    switch (view) {
      case "month":
        return moment(date).format("MMMM YYYY"); // "Janvier 2024"
      case "week":
        const start = moment(date).startOf("week");
        const end = moment(date).endOf("week");
        return `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`;
      case "day":
        return moment(date).format("dddd DD MMMM YYYY"); // "Lundi 25 décembre 2024"
      case "agenda":
        return "Agenda";
      default:
        return "";
    }
  };

  return (
    <div className="rbc-toolbar">
      {/* Boutons de navigation */}
      <div className="rbc-btn-group">
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          Précédent
        </Button>

        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Aujourd'hui
        </Button>

        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          Suivant
        </Button>
      </div>

      {/* Titre (mois/semaine/jour actuel) */}
      <span className="rbc-toolbar-label font-semibold text-lg">
        {getTitle()}
      </span>

      {/* Boutons de vue */}
      <div className="rbc-btn-group">
        {views.map((viewName) => (
          <Button
            key={viewName}
            variant={view === viewName ? "default" : "outline"}
            size="sm"
            onClick={() => onView(viewName)}
            className="capitalize"
          >
            {viewName === "month" && "Mois"}
            {viewName === "week" && "Semaine"}
            {viewName === "day" && "Jour"}
            {viewName === "agenda" && "Agenda"}
          </Button>
        ))}
      </div>
    </div>
  );
}
