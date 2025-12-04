import { useWorkoutFormStore } from "@/Features/Workouts/store";

// Filtre par groupe musculaire avec compteurs d'exercices par muscle.
export default function WorkoutMuscleFilters({ muscles, muscleCounts = {} }) {
  // Store
  const selectedMuscle = useWorkoutFormStore((state) => state.selectedMuscle);
  const setSelectedMuscle = useWorkoutFormStore(
    (state) => state.setSelectedMuscle,
  );
  // Compteur de tous les exercices
  const totalCount = Object.values(muscleCounts).reduce((acc, mus) => {
    return acc + mus;
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
        onChange={(e) => setSelectedMuscle(e.target.value)}
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
