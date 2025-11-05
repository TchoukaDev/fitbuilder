export default function ExerciseGroupSelect({
  onSelectExerciseId,
  grouped,
  errorNoExercise,
}) {
  return (
    <div>
      <p className="text-center my-3">Choisir un exercice</p>

      <select
        className="input pt-2"
        onChange={(e) => {
          onSelectExerciseId(e.target.value);
        }}
      >
        <option value="" className="font-semibold">
          --- Sélectionner un exercice ---
        </option>
        {/* Options */}
        {Object.entries(grouped).map(([_, exs]) =>
          exs.map((ex) => (
            <option value={ex._id} key={ex._id}>
              {ex.name}
            </option>
          )),
        )}
      </select>
      {errorNoExercise && (
        <p className="formError my-3">Vous devez sélectionner un exercice</p>
      )}
    </div>
  );
}
