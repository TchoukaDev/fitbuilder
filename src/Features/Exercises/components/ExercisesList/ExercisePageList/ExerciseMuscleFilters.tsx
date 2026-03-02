// Boutons de filtrage par groupe musculaire

type ExerciseMuscleFiltersProps = {
  muscles: string[];
  selectedMuscle: string;
  onMuscleChange: (muscle: string) => void;
}
export default function ExerciseMuscleFilters({
  muscles,
  selectedMuscle,
  onMuscleChange,
}: ExerciseMuscleFiltersProps) {
  if (muscles.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2.5 mb-5 overflow-x-auto px-1">
      {/* Bouton "Tous" */}
      <button
        onClick={() => onMuscleChange("all")}
        className={`py-3 px-4 border-none rounded-md cursor-pointer shrink-0 ${
          selectedMuscle === "all"
            ? "bg-primary-500 text-white"
            : "bg-primary-50 text-primary-800"
        }`}
      >
        Tous
      </button>

      {/* Boutons par muscle */}
      {muscles.map((muscle) => (
        <button
          key={muscle}
          onClick={() => onMuscleChange(muscle)}
          className={`py-3 px-4 border-none rounded-md cursor-pointer shrink-0 ${
            selectedMuscle === muscle
              ? "bg-primary-500 text-white"
              : "bg-primary-50 text-primary-800"
          }`}
        >
          {muscle}
        </button>
      ))}
    </div>
  );
}
