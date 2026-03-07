import { useWorkoutStore } from "@/Features/Workouts/store";
import { Exercise } from "@/types/exercise";

// Sélecteur d'exercices groupés par muscle avec gestion d'erreur.
export default function WorkoutExerciseGroupSelect({ grouped }: { grouped: Record<string, Exercise[]> }) {
  const setSelectedExerciseId = useWorkoutStore(
    (state) => state.setSelectedExerciseId,
  );

  const totalCount = Object.values(grouped).reduce((sum, exs) => sum + exs.length, 0);

  return (
    <div className="flex flex-col gap-2 mt-3">
      <label
        htmlFor="exercise"
        className="text-sm text-primary-500 text-center font-semibold"
      >
        Choisir un exercice: <span className="text-accent-500">*</span>
      </label>

      <select
        className="input pt-2"
        onChange={(e) => {
          setSelectedExerciseId(e.target.value);
        }}
      >
        <option value="" className="font-semibold">
          {totalCount === 0 ? "Aucun exercice trouvé" : `--- Sélectionner un exercice (${totalCount})`}
        </option>
        {/* Options */}
        {Object.entries(grouped).map(([_, exs]) =>
          exs.map((ex) => (
            <option value={ex.exerciseId} key={ex.exerciseId}>
              {ex.name} {ex.isPublic === false && "(Perso)"}
            </option>
          )),
        )}
      </select>
    </div>
  );
}
