export default function WorkoutMuscleFilters({
  muscles,
  onMuscleChange,
  muscleCounts = {},
}) {
  const totalCount = Object.values(muscleCounts).reduce((acc, mus) => {
    return acc + mus;
  }, 0);
  if (muscles.length === 0) {
    return null;
  }

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
