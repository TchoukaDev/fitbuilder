import ExerciseGroupSelect from "@/components/Exercises/ExerciseGroup/ExerciseGroupSelect";
import ExerciseTabs from "@/components/Exercises/ExerciseTabs/ExerciseTabs";
import MuscleFilters from "@/components/Exercises/MusclesFilters/MuscleFilters";
import SearchExercise from "../SearchExercise/SearchExercise";
import Button from "@/components/Buttons/Button";

export default function ExerciceSelectorStep1({
  exercises,
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
  grouped,
  onCloseExerciceSelector,
  setStep,
  search,
  setSearch,
}) {
  return (
    <>
      {/* Barre de recherche d'exercices */}
      <SearchExercise search={search} onSearchChange={setSearch} />
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
        exercises={exercises}
        onSelectExerciseId={setSelectedExerciseId}
        grouped={grouped}
      />
      <Button close type="button" onClick={onCloseExerciceSelector}>
        Annuler
      </Button>
      <Button type="button" onClick={() => setStep(2)}>
        Valider
      </Button>
    </>
  );
}
