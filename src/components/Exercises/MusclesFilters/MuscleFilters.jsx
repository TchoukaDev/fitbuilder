export default function MuscleFilters({
  muscles,
  selectedMuscle,
  onMuscleChange,
  inModal,
  muscleCounts,
}) {
  if (inModal) {
    const totalCount = Object.values(muscleCounts).reduce((acc, mus) => {
      return acc + mus;
    }, 0);

    return (
      <div>
        <p className="text-center my-3">Filtrer par muscle</p>
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
            : "bg-primary-50 text-primary-800"
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
              : "bg-primary-50 text-primary-800"
          }`}
        >
          {muscle}
        </button>
      ))}
    </div>
  );
}
