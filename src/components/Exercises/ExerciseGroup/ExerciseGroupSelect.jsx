export default function ExerciseGroupSelect({
  exercises,
  onSelectExerciseId,

  grouped,
}) {
  return (
    <select
      onChange={(e) => {
        onSelectExerciseId(e.target.value);
      }}
    >
      {/* Options */}
      {Object.entries(grouped).map(([_, exs]) =>
        exs.map((ex) => (
          <option value={ex._id} key={ex._id}>
            {ex.name}
          </option>
        )),
      )}
    </select>
  );
}
