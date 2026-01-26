// Filtre par groupe musculaire avec compteurs d'exercices par muscle.
interface WorkoutMuscleFiltersProps {
  muscles: string[];
  muscleCounts?: Record<string, number>;
  onMuscleChange: (muscle: string) => void
}

export default function WorkoutMuscleFilters({
  muscles,
  muscleCounts = {},
  onMuscleChange,
}: WorkoutMuscleFiltersProps) {
  // Compteur de tous les exercices
  const totalCount = Object.values(muscleCounts).reduce((acc, muscleCount) => {
    return acc + muscleCount;
  }, 0);

  return (
    <div className="flex flex-col text-center gap-2 mt-3">
      <label
        htmlFor="muscleFilter"
        className="text-sm text-primary-500 font-semibold"
      >
        Filtrer par muscle:
      </label>
      <select
        className="input pt-2"
        onChange={(e) => onMuscleChange(e.target.value)}
      >
        <option value="all">Tous ({totalCount})</option>
        {muscles.map((muscle, i) => (
          <option key={i} value={muscle}>
            {muscle} ({muscleCounts[muscle]})
          </option>
        ))}
      </select>
    </div>
  );
}
