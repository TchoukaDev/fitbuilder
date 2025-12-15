"use client";

// Étape de sélection d'un exercice (recherche, filtres, groupes) avant configuration.
import { useEffect } from "react";
import { Button } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import WorkoutExerciseTabs from "./WorkoutExerciseTab";
import WorkoutMuscleFilters from "./WorkoutMuscleFilters";
import WorkoutExerciseGroupSelect from "./WorkoutExerciseGroupSelect";
import SearchExercise from "./SearchExercise";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { useExerciseFilters } from "@/Features/Exercises/hooks";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";

export default function ExerciseSelector({
  exercises,
  favoritesExercises,
  isAdmin,
}) {
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
    fixedMuscleCounts: muscleCounts,
    allExerciseMuscles,
    myExerciseMuscles,
    favoriteExerciseMuscles,
    activeTab,
    setActiveTab,
    setSelectedMuscle,
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
      <SearchExercise search={search} setSearch={setSearch} />

      {/* Sélecteur des exercices par type */}
      <WorkoutExerciseTabs
        counts={counts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Filtres par muscle*/}
      {activeTab === "all" && (
        <WorkoutMuscleFilters
          onMuscleChange={setSelectedMuscle}
          muscles={allExerciseMuscles}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "mine" && (
        <WorkoutMuscleFilters
          onMuscleChange={setSelectedMuscle}
          muscles={myExerciseMuscles}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "favorites" && (
        <WorkoutMuscleFilters
          onMuscleChange={setSelectedMuscle}
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
      <div className="modalFooter">
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
      <RequiredFields />
    </div>
  );
}
