export default function MuscleFilters({
  muscles,
  selectedMuscle,
  onMuscleChange,
}) {
  if (muscles.length === 0) {
    return null;
  }
  return (
    <div className="flex gap-2.5 mb-5 flex-wrap">
      <button
        onClick={() => onMuscleChange("all")}
        className={`py-2 px-4 border-none rounded-md cursor-pointer ${
          selectedMuscle === "all"
            ? "bg-primary-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        Tous
      </button>

      {muscles.map((muscle) => (
        <button
          key={muscle}
          onClick={() => onMuscleChange(muscle)}
          className={`py-2 px-4 border-none rounded-md cursor-pointer ${
            selectedMuscle === muscle
              ? "bg-primary-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {muscle}
        </button>
      ))}
    </div>
  );
}
