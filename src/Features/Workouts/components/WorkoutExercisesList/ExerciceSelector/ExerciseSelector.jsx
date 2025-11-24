import SearchExercise from "./SearchExercise";
import { useEffect, useState } from "react";
import Button from "@/Global/components/ui/Button";
import { useModals } from "@/Providers/ModalContext";
import WorkoutExerciseTabs from "./WorkoutExerciseTab";
import WorkoutMuscleFilters from "./WorkoutMuscleFilters";
import WorkoutExerciseGroupSelect from "@/Features/Workouts/components/WorkoutExercisesList/ExerciceSelector/WorkoutExerciseGroupSelect";

export default function ExerciseSelector({
  activeTab,
  setActiveTab,
  counts,
  muscleCounts,
  allExerciseMuscles,
  myExerciseMuscles,
  setSelectedMuscle,
  favoriteExerciseMuscles,
  setSelectedExerciseId,
  exercisesAdded,
  selectedExerciseId,
  grouped,
  setStep,
  search,
  onSearchChange,
  onSetTitle,
}) {
  const [error, setError] = useState(null); //Erreur si pas d'exercice sélectionné

  const { closeModal } = useModals();

  // Vérifier si un exercice est sélectionner avant de passer à l'étape 2
  const handleSubmit = () => {
    if (!selectedExerciseId) {
      setError("Veuillez sélectionner un exercice");
      return;
    }
    // Vérifier si l'exercie a déjà été ajouté
    if (exercisesAdded.some((ex) => ex._id === selectedExerciseId)) {
      setError("Cet exercice a déjà été ajouté");
      return;
    }

    setError(null);
    setStep(2);
  };
  // Modifier le titre de la modale
  useEffect(() => {
    onSetTitle("Ajouter un exercice");
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Barre de recherche d'exercices */}
      <SearchExercise search={search} onSearchChange={onSearchChange} />
      {/* Sélecteur des exercices par type */}
      <WorkoutExerciseTabs onTabChange={setActiveTab} counts={counts} />
      {/* FILTRES PAR MUSCLE */}
      {activeTab === "all" && (
        <WorkoutMuscleFilters
          muscles={allExerciseMuscles}
          onMuscleChange={setSelectedMuscle}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "mine" && (
        <WorkoutMuscleFilters
          muscles={myExerciseMuscles}
          onMuscleChange={setSelectedMuscle}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "favorites" && (
        <WorkoutMuscleFilters
          muscles={favoriteExerciseMuscles}
          onMuscleChange={setSelectedMuscle}
        />
      )}

      {/*  sélecteur d'exercices par muscle */}
      <WorkoutExerciseGroupSelect
        onSelectExerciseId={setSelectedExerciseId}
        error={error}
        grouped={grouped}
        exercisesAdded={exercisesAdded}
      />
      <div className="flex items-center gap-3 my-5">
        <Button
          type="button"
          close
          onClick={() => closeModal("workoutSelectExercise")}
        >
          Annuler
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Valider
        </Button>
      </div>
      <p className="text-xs text-center">(*) Champs obligatoires</p>
    </div>
  );
}
