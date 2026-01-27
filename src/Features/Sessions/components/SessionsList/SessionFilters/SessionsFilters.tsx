// Filtres pour les séances : période, statut (complétées/en cours/planifiées), workout.
import { Calendar, Filter } from "lucide-react";
import { FilterSelect } from ".";
import { WorkoutSession } from "@/types/workoutSession";

interface SessionFiltersProps {
  statusFilter: string;
  dateFilter: string;
  workoutFilter: string;
  onWorkoutFilterChange: (workoutFilter: string) => void;
  sessions: WorkoutSession[];
  onStatusChange: (statusFilter: string) => void;
  onDateFilterChange: (dateFilter: string) => void;
  isFetching: boolean;
}

export default function SessionFilters({
  statusFilter,
  dateFilter,
  workoutFilter,
  onWorkoutFilterChange,
  sessions,
  onStatusChange,
  onDateFilterChange,
  isFetching,
}: SessionFiltersProps) {

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
    { value: "in-progress", label: "En cours", color: "accent" },
    { value: "planned", label: "Planifiées", color: "primary" },
  ];


  // Retirer les doublons d'entrainement
  const workoutSet = new Set<string>();
  sessions.forEach((s) => workoutSet.add(s.workoutName));

  const workoutFilters = [
    {
      value: "all",
      label: "Tous",
    },

    ...[...workoutSet].map(
      (s) =>
      ({
        value: s,
        label: s,
      }),
    ),
  ];
  return (
    <>
      {/* FILTRE PAR PÉRIODE */}
      <div className="mb-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par période
          </span>
        </div>

        <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
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
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
          <FilterSelect
            filters={dateFilters}
            onSelectChange={onDateFilterChange}
            isFetching={isFetching}
            id="dateFilter"
          />
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

        <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
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
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
          <FilterSelect
            filters={statusFilters}
            onSelectChange={onStatusChange}
            isFetching={isFetching}
            id="statusFilter"
          />
        </div>
      </div>

      {/* FILTRE PAR ENTRAÎNEMENT */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filtrer par entraînement
          </span>
        </div>

        <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
          {workoutFilters.map((filter, index) => (
            <FilterButton
              key={index}
              label={filter.label}
              isActive={workoutFilter === filter.value}
              onClick={() => onWorkoutFilterChange(filter.value)}
              disabled={isFetching}
              activeColor="primary"
            />
          ))}
        </div>
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
          <FilterSelect
            filters={workoutFilters}
            onSelectChange={onWorkoutFilterChange}
            isFetching={isFetching}
            id="workoutFilter"
          />
        </div>
      </div>
    </>
  );
}

// Bouton de filtre réutilisable avec état actif
interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  activeColor: string
}
function FilterButton({
  label,
  isActive,
  onClick,
  disabled,
  activeColor = "primary",
}: FilterButtonProps) {
  const colorClasses = {
    primary: "bg-primary-600 text-white",
    green: "bg-green-600 text-white",
    accent: "bg-accent-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${isActive
        ? colorClasses[activeColor]
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}
