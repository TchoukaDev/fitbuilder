// Boutons de filtrage par groupe musculaire
export default function ExerciseMuscleFilters({
  muscles,
  selectedMuscle,
  onMuscleChange,
}) {
  if (muscles.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2.5 mb-5 flex-wrap">
      {/* Bouton "Tous" */}
      <button
        onClick={() => onMuscleChange("all")}
        className={`py-2 px-4 border-none rounded-md cursor-pointer ${
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
          className={`py-2 px-4 border-none rounded-md cursor-pointer ${
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
