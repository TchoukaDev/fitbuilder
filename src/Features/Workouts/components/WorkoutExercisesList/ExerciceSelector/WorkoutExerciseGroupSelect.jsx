// Sélecteur d'exercices groupés par muscle avec gestion d'erreur.
export default function WorkoutExerciseGroupSelect({
  onSelectExerciseId,
  grouped,
  error,
}) {
  return (
    <div>
      <p className="text-center my-3">Choisir un exercice*</p>

      <select
        className="input pt-2"
        onChange={(e) => {
          onSelectExerciseId(e.target.value);
        }}
      >
        <option value="" className="font-semibold">
          --- Sélectionner un exercice ---
        </option>
        {Object.entries(grouped).length === 0 && (
          <option value="">Aucun exercice trouvé</option>
        )}
        {/* Options */}
        {Object.entries(grouped).map(([_, exs]) =>
          exs.map((ex) => (
            <option value={ex._id} key={ex._id}>
              {ex.name} {ex.type === "private" && "(Perso)"}
            </option>
          )),
        )}
      </select>
      {error && <p className="formError my-3">{error}</p>}
    </div>
  );
}
