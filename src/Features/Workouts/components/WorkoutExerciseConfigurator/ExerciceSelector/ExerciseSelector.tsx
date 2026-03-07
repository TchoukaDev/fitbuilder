"use client";

// Étape de sélection d'un exercice (recherche, filtres, groupes) avant configuration.
import { useEffect } from "react";
import { Button } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import WorkoutExerciseTabs from "./WorkoutExerciseTab";
import WorkoutExerciseGroupSelect from "./WorkoutExerciseGroupSelect";
import SearchExercise from "./SearchExercise";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { useExerciseFilters } from "@/Features/Exercises/hooks";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { Exercise } from "@/types/exercise";


type ExerciseSelectorProps = {
  exercises: Exercise[];
  favoritesExercises: string[];
  isAdmin: boolean;
}
export default function ExerciseSelector({
  exercises,
  favoritesExercises,
  isAdmin,
}: ExerciseSelectorProps) {
  // Store
  const exercisesAdded = useWorkoutStore((state) => state.exercises);
  const selectedExerciseId = useWorkoutStore(
    (state) => state.selectedExerciseId,
  );
  const setStepAction = useWorkoutStore((state) => state.setStep);
  const errorSelectedExerciseId = useWorkoutStore(
    (state) => state.errorSelectedExerciseId,
  );
  const setErrorSelectedExerciseId = useWorkoutStore(
    (state) => state.setErrorSelectedExerciseId,
  );

  // Filtres
  const {
    grouped,
    counts,
    activeTab,
    setActiveTab,
    selectedSecondaryMuscle,
    setSelectedSecondaryMuscle,
    muscleSelectGroups,
    search,
    setSearch,
  } = useExerciseFilters({
    exercises,
    favoritesExercises,
    isAdmin,
  });

  const setModaleTitle = useWorkoutStore((state) => state.setModaleTitle);
  const { closeModal } = useModals();

  // Vérifier si un exercice est sélectionner avant de passer à l'étape 2
  const handleSubmit = () => {
    if (!selectedExerciseId) {
      setErrorSelectedExerciseId("Veuillez sélectionner un exercice");
      return;
    }
    // Vérifier si l'exercie a déjà été ajouté
    if (exercisesAdded.some((ex) => ex.exerciseId === selectedExerciseId)) {
      setErrorSelectedExerciseId("Cet exercice a déjà été ajouté");
      return;
    }

    setErrorSelectedExerciseId(null);
    setStepAction(2);
  };
  // Modifier le titre de la modale
  useEffect(() => {
    setModaleTitle("Ajouter un exercice");
  }, [setModaleTitle]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Barre de recherche d'exercices */}
      <SearchExercise search={search} setSearch={setSearch} />

      {/* Sélecteur des exercices par type */}
      <WorkoutExerciseTabs
        counts={counts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Filtre muscle granulaire groupé par catégorie */}
      {muscleSelectGroups.length > 0 && (
        <div className="flex flex-col gap-2 mt-3">
          <label
            htmlFor="secondaryMuscle"
            className="text-sm text-primary-500 font-semibold"
          >
            Filtrer par muscle: <span className="text-accent-500">*</span>
          </label>
          <select
            className="input py-2 peer"
            value={selectedSecondaryMuscle}
            onChange={(e) => setSelectedSecondaryMuscle(e.target.value)}
            aria-label="Filtrer par muscle"
          >
            <option value="all">-- Tous les muscles --</option>
            {muscleSelectGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.muscles.map(({ name, count }) => (
                  <option key={name} value={name}>{name} ({count})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/*  sélecteur d'exercices par muscle */}
      <WorkoutExerciseGroupSelect grouped={grouped} />
      {/* Erreur formulaire */}
      {errorSelectedExerciseId && (
        <p className="formError my-3">{errorSelectedExerciseId}</p>
      )}

      {/* Actions */}
      <div className="modalFooter">
        <Button
          type="button"
          variant="close"
          onClick={() => {
            closeModal("workoutSelectExercise");
          }}
        >
          Annuler
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Valider
        </Button>
      </div>
      <RequiredFields />
    </div>
  );
}
