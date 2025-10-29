export default function ExercisesList({ initialExercises = [] }) {
  const exercises = initialExercises || [];

  return (
    <select>
      {exercises?.map((e) => (
        <option key={e._id} value={e.name}>
          {e.name}
        </option>
      ))}
    </select>
  );
}
