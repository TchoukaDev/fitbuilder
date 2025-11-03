"use client";

import { useState } from "react";
import ExerciseTabs from "../ExerciseTabs/ExerciseTabs";
import MuscleFilters from "../MusclesFilters/MuscleFilters";
import ExerciseGroup from "../ExerciseGroup/ExerciseGroup";
import Button from "@/components/Buttons/Button";
import ExerciseModal from "@/components/Modals/ExerciseModal/ExerciseModal";
import { useExercises, useFavorites } from "@/hooks/useExercises";
import ExerciceSelectorStep1 from "@/components/Workouts/ExerciceSelectors/ExerciceSelectorStep1";
import ExerciceSelectorStep2 from "@/components/Workouts/ExerciceSelectors/ExerciceSelectorStep2";

export default function ExercisesList({
  initialExercises,
  initialFavorites,
  isAdmin,
  userId,
  inModal,
  onCloseExerciceSelector,
  onSelectExercise,
}) {
  // HOOKS

  // Récupérer exercices
  const { data: cachedExercises = [], isLoading } = useExercises(
    userId,
    isAdmin,
    initialExercises,
  );

  // Récupérer favoris
  const { data: favorites = [], isLoading: loadingFavorites } = useFavorites(
    userId,
    initialFavorites,
  );

  // STATE
  const [activeTab, setActiveTab] = useState("all"); //all, mine, favorites
  const [selectedMuscle, setSelectedMuscle] = useState("all"); //Muscle sélectionné
  const [isOpen, setIsOpen] = useState(null); //Gestion des modales
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null); //id de l'exercice en cours de sélection

  // Fermeture des modales ajout et modification d'exercice (ExercisePage)
  const onClose = () => {
    setIsOpen(null);
  };

  // Ajouter l'exercice sélectionner au Workout
  // const exerciseSelected = exercises.filter(
  //   (ex) => ex._id === selectedExerciseId,
  // )[0];
  // onSelectExercise(exerciseSelected);

  // ✅ Filtrer avec la recherche
  const exercises = cachedExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Exercices de l'utilisateur (privés) ou public si admin
  const myExercises = isAdmin
    ? exercises?.filter((ex) => ex.type === "public")
    : exercises?.filter((ex) => ex.type === "private");

  // Récupérer les détails des exercices favoris avec leur id (données db)
  const favoriteExercises = exercises.filter((ex) =>
    favorites.includes(ex._id),
  );

  //  Muscles travaillés dans les exercices
  const allExerciseMuscles = [
    ...new Set(exercises.map((ex) => ex.muscle)),
  ].sort();
  const myExerciseMuscles = [
    ...new Set(myExercises.map((ex) => ex.muscle)),
  ].sort();
  const favoriteExerciseMuscles = [
    ...new Set(favoriteExercises.map((ex) => ex.muscle)),
  ].sort();

  // Fonction qui retourne le nombre d'exercice par muscle pour TOUS les exercices (filtrés si search)
  const countByMuscle = (exercises) => {
    // Groupe global : tous les exercices par muscle
    const allGrouped = exercises.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});

    // Compteur pour les options
    const muscleCounts = Object.fromEntries(
      Object.entries(allGrouped).map(([muscle, exs]) => [muscle, exs.length]),
    );

    return muscleCounts;
  };

  // Exercices à afficher selon l'onglet
  let displayedExercises = [];
  let muscleCounts;
  if (activeTab === "all") {
    muscleCounts = countByMuscle(exercises);
    displayedExercises =
      selectedMuscle === "all"
        ? exercises //si "all -> Tous les exercices
        : exercises.filter((ex) => ex.muscle === selectedMuscle); //Sinon les exercices du muscle sélectionné
  } else if (activeTab === "mine") {
    muscleCounts = countByMuscle(myExercises);
    displayedExercises =
      selectedMuscle === "all"
        ? myExercises
        : myExercises.filter((ex) => ex.muscle === selectedMuscle);
  } else if (activeTab === "favorites") {
    muscleCounts = countByMuscle(favoriteExercises);
    displayedExercises =
      selectedMuscle === "all"
        ? favoriteExercises
        : favoriteExercises.filter((ex) => ex.muscle === selectedMuscle);
  }

  // Nombre d'exercice par muscle pour CHAQUE TYPE d'exercice (DisplayedExercises)
  const grouped = displayedExercises.reduce((acc, ex) => {
    if (!acc[ex.muscle]) acc[ex.muscle] = [];
    acc[ex.muscle].push(ex);
    return acc;
  }, {});

  // Compteurs pour les onglets
  const counts = {
    all: exercises.length || 0,
    mine: myExercises?.length || 0,
    favorites: favorites?.length || 0,
  };

  // RENDER

  // MODALE POUR WORKOUT
  if (inModal) {
    // ETAPE 1: Sélection de l'exercice
    if (step === 1) {
      return (
        <ExerciceSelectorStep1
          exercises={exercises}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          muscleCounts={muscleCounts}
          allExerciseMuscles={allExerciseMuscles}
          favoriteExerciseMuscles={favoriteExerciseMuscles}
          myExerciseMuscles={myExerciseMuscles}
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          setSelectedExerciseId={setSelectedExerciseId}
          grouped={grouped}
          onCloseExerciceSelector={onCloseExerciceSelector}
          setStep={setStep}
          search={search}
          onsearchChange={setSearch}
        />
      );
    }

    //ETAPE 2: Configuration de l'exercice
    if (step === 2) {
      return <ExerciceSelectorStep2 />;
    }
  }

  // LISTE POUR PAGE EXERCICES
  return (
    <div>
      {/* ONGLETS */}
      <ExerciseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        inModal={inModal}
      />{" "}
      {/* BOUTON CRÉER (onglet "Mes exercices") */}
      {activeTab === "mine" && (
        <div className="mb-5">
          <Button onClick={() => setIsOpen("create")}>
            + Créer un nouvel exercice
          </Button>
        </div>
      )}
      {/* Modal de création d'exercice */}
      {isOpen === "create" && <ExerciseModal onClose={onClose} />}
      {/* FILTRES PAR MUSCLE */}
      {activeTab === "all" && (
        <MuscleFilters
          muscles={allExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
        />
      )}
      {activeTab === "mine" && (
        <MuscleFilters
          muscles={myExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
        />
      )}
      {activeTab === "favorites" && (
        <MuscleFilters
          muscles={favoriteExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
        />
      )}
      {/* LISTE DES EXERCICES GROUPÉS */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {activeTab === "mine"
            ? "Aucun exercice créé"
            : activeTab === "favorites"
            ? "Aucun exercice favori"
            : "Aucun exercice"}
        </p>
      ) : (
        Object.entries(grouped).map(([muscle, exs]) => (
          <ExerciseGroup
            key={muscle}
            muscle={muscle}
            exercises={exs}
            activeTab={activeTab}
            favorites={favorites}
            userId={userId}
            isAdmin={isAdmin}
          />
        ))
      )}
    </div>
  );
}
