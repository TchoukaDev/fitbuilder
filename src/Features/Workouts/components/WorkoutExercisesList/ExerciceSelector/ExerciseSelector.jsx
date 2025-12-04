"use client";

// Étape de sélection d'un exercice (recherche, filtres, groupes) avant configuration.
import { useEffect } from "react";
import { Button } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import WorkoutExerciseTabs from "./WorkoutExerciseTab";
import WorkoutMuscleFilters from "./WorkoutMuscleFilters";
import WorkoutExerciseGroupSelect from "./WorkoutExerciseGroupSelect";
import SearchExercise from "./SearchExercise";
import { useWorkoutFormStore } from "@/Features/Workouts/store/workoutFormStore";
export default function ExerciseSelector({
  counts,
  muscleCounts,
  allExerciseMuscles,
  myExerciseMuscles,
  favoriteExerciseMuscles,
  grouped,
}) {
  // Store
  const exercisesAdded = useWorkoutFormStore((state) => state.exercises);
  const selectedExerciseId = useWorkoutFormStore(
    (state) => state.selectedExerciseId,
  );
  const setStepAction = useWorkoutFormStore((state) => state.setStep);
  const clearAll = useWorkoutFormStore((state) => state.clearAll);
  const errorSelectedExerciseId = useWorkoutFormStore(
    (state) => state.errorSelectedExerciseId,
  );
  const setErrorSelectedExerciseId = useWorkoutFormStore(
    (state) => state.setErrorSelectedExerciseId,
  );
  const activeTab = useWorkoutFormStore((state) => state.activeTab);
  const setModaleTitle = useWorkoutFormStore((state) => state.setModaleTitle);
  const { closeModal } = useModals();

  // Vérifier si un exercice est sélectionner avant de passer à l'étape 2
  const handleSubmit = () => {
    if (!selectedExerciseId) {
      setErrorSelectedExerciseId("Veuillez sélectionner un exercice");
      return;
    }
    // Vérifier si l'exercie a déjà été ajouté
    if (exercisesAdded.some((ex) => ex._id === selectedExerciseId)) {
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
      <SearchExercise />

      {/* Sélecteur des exercices par type */}
      <WorkoutExerciseTabs counts={counts} />

      {/* Filtres par muscle*/}
      {activeTab === "all" && (
        <WorkoutMuscleFilters
          muscles={allExerciseMuscles}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "mine" && (
        <WorkoutMuscleFilters
          muscles={myExerciseMuscles}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "favorites" && (
        <WorkoutMuscleFilters
          muscles={favoriteExerciseMuscles}
          muscleCounts={muscleCounts}
        />
      )}

      {/*  sélecteur d'exercices par muscle */}
      <WorkoutExerciseGroupSelect grouped={grouped} />
      {/* Erreur formulaire */}
      {errorSelectedExerciseId && (
        <p className="formError my-3">{errorSelectedExerciseId}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 my-5">
        <Button
          type="button"
          close
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
      <p className="text-xs text-gray-500 text-center">
        <span className="text-accent-500">*</span> Champs obligatoires
      </p>
    </div>
  );
}
