// components/Features/Sessions/SessionsList/SessionFilters.jsx

import { Calendar, Filter } from "lucide-react";

export default function SessionFilters({
  statusFilter,
  dateFilter,
  templateFilter,
  onTemplateFilterChange,
  sessions,
  onStatusChange,
  onDateFilterChange,
  isFetching,
}) {
  const dateFilters = [
    { value: "all", label: "Toutes" },
    { value: "week", label: "7 derniers jours" },
    { value: "month", label: "30 derniers jours" },
    { value: "quarter", label: "3 derniers mois" },
    { value: "year", label: "Dernière année" },
  ];

  const statusFilters = [
    { value: "all", label: "Toutes", color: "primary" },
    { value: "completed", label: "Terminées", color: "green" },
    { value: "in-progress", label: "En cours", color: "primary" },
    { value: "planned", label: "Planifiées", color: "accent" },
  ];

  // Retirer les doublons d'entrainement
  const templateSet = new Set();
  sessions.forEach((s) => templateSet.add(s.templateName));

  const templateFilters = [
    {
      value: "all",
      label: "Tous",
    },

    ...[...templateSet].map(
      (s) =>
        ({
          value: s,
          label: s,
        } || {}),
    ),
    ,
  ];
  return (
    <>
      {/* FILTRE PAR PÉRIODE */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par période
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {dateFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              label={filter.label}
              isActive={dateFilter === filter.value}
              onClick={() => onDateFilterChange(filter.value)}
              disabled={isFetching}
              activeColor="primary"
            />
          ))}
        </div>
      </div>

      {/* FILTRE PAR STATUT */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par statut
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              label={filter.label}
              isActive={statusFilter === filter.value}
              onClick={() => onStatusChange(filter.value)}
              disabled={isFetching}
              activeColor={filter.color}
            />
          ))}
        </div>
      </div>

      {/* FILTRE PAR TEMPLATE */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par entraînement
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {templateFilters.map((filter, index) => (
            <FilterButton
              key={index}
              label={filter.label}
              isActive={templateFilter === filter.value}
              onClick={() => onTemplateFilterChange(filter.value)}
              disabled={isFetching}
              activeColor={filter.color}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// 🔘 COMPOSANT BOUTON FILTRE RÉUTILISABLE
// ═══════════════════════════════════════════════════════
function FilterButton({
  label,
  isActive,
  onClick,
  disabled,
  activeColor = "primary",
}) {
  const colorClasses = {
    primary: "bg-primary-600 text-white",
    green: "bg-green-600 text-white",
    accent: "bg-accent-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
        isActive
          ? colorClasses[activeColor]
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}
