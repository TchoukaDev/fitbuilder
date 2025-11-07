import ExerciseGroupSelect from "@/components/Exercises/ExerciseGroup/ExerciseGroupSelect";
import ExerciseTabs from "@/components/Exercises/ExerciseTabs/ExerciseTabs";
import MuscleFilters from "@/components/Exercises/MusclesFilters/MuscleFilters";
import SearchExercise from "../SearchExercise/SearchExercise";
import { useState } from "react";
import Button from "@/components/Buttons/Button";

export default function ExerciceSelector({
  activeTab,
  setActiveTab,
  counts,
  muscleCounts,
  allExerciseMuscles,
  myExerciseMuscles,
  selectedMuscle,
  setSelectedMuscle,
  favoriteExerciseMuscles,
  setSelectedExerciseId,
  exercisesAdded,
  selectedExerciseId,
  grouped,
  setStep,
  search,
  onSearchChange,
  onCloseExerciseSelector,
}) {
  const [error, setError] = useState(null); //Erreur si pas d'exercice sélectionné
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

  return (
    <div className="flex flex-col items-center gap-3">
      <h2>Ajouter un exercice</h2>
      {/* Barre de recherche d'exercices */}
      <SearchExercise search={search} onSearchChange={onSearchChange} />
      {/* Sélecteur des exercices par type */}
      <ExerciseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        inModal={true}
        muscleCounts={muscleCounts}
      />
      {/* FILTRES PAR MUSCLE */}
      {activeTab === "all" && (
        <MuscleFilters
          muscles={allExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
          inModal={true}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "mine" && (
        <MuscleFilters
          muscles={myExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
          inModal={true}
          muscleCounts={muscleCounts}
        />
      )}
      {activeTab === "favorites" && (
        <MuscleFilters
          muscles={favoriteExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
          inModal={true}
        />
      )}

      {/*  sélecteur d'exercices par muscle */}
      <ExerciseGroupSelect
        onSelectExerciseId={setSelectedExerciseId}
        error={error}
        grouped={grouped}
        onCloseExerciseSelector={onCloseExerciseSelector}
        exercisesAdded={exercisesAdded}
      />
      <div className="flex items-center gap-3 my-5">
        <Button type="button" close onClick={onCloseExerciseSelector}>
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
