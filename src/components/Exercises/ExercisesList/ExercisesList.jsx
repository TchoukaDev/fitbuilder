"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExerciseTabs from "../ExerciseTabs/ExerciseTabs";
import MuscleFilters from "../MusclesFilters/MuscleFilters";
import ExerciseGroup from "../ExerciseGroup/ExerciseGroup";
import Button from "@/components/Buttons/Button";
import Modal from "@/components/Modal/Modal";

export default function ExercisesList({
  isAdmin = false,
  initialExercises,
  initialFavorites = [],
}) {
  // STATE

  const [exercises, setExercises] = useState(initialExercises); //Tous les exercices
  const [favorites, setFavorites] = useState(initialFavorites); //Les exercices favoris
  const [activeTab, setActiveTab] = useState("all"); //all, mine, favorites
  const [selectedMuscle, setSelectedMuscle] = useState("all"); //Muscle sélectionné
  const [isOpen, setIsOpen] = useState(null); //Gestion des modales

  // Fermeture des modales
  const onClose = () => {
    setIsOpen(null);
  };

  const router = useRouter();

  // Pour synchroniser les données en direct après modifications des données serveurs
  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);

  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  // Exercices de l'utilisateur (privés) ou public si admin
  const myExercises = isAdmin
    ? exercises.filter((ex) => ex.type === "public")
    : exercises.filter((ex) => ex.type === "private");

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

  // Exercices à afficher selon l'onglet
  let displayedExercises = [];
  if (activeTab === "all") {
    displayedExercises =
      selectedMuscle === "all"
        ? exercises //si "all -> Tous les exercices
        : exercises.filter((ex) => ex.muscle === selectedMuscle); //Sinon les exercices du muscle sélectionné
  } else if (activeTab === "mine") {
    displayedExercises =
      selectedMuscle === "all"
        ? myExercises
        : myExercises.filter((ex) => ex.muscle === selectedMuscle);
  } else if (activeTab === "favorites") {
    displayedExercises =
      selectedMuscle === "all"
        ? favoriteExercises
        : favoriteExercises.filter((ex) => ex.muscle === selectedMuscle);
  }

  // Grouper par muscle (transformer le tableau des exercices en objet d'exercices par muscle)
  const grouped = displayedExercises.reduce((acc, ex) => {
    if (!acc[ex.muscle]) acc[ex.muscle] = [];
    acc[ex.muscle].push(ex);
    return acc;
  }, {});

  // Compteurs pour les onglets
  const counts = {
    all: exercises.length,
    mine: myExercises.length,
    favorites: favorites.length,
  };

  // ========================================
  // HANDLERS
  // ========================================

  //  Gestion des favorises
  const toggleFavorite = async (exerciseId) => {
    const isFavorite = favorites.includes(exerciseId);

    // Rendu optimiste
    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== exerciseId)
      : [...favorites, exerciseId];

    setFavorites(newFavorites);

    // mise à jour en db
    await fetch("/api/exercises/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites: newFavorites }),
    });
  };

  // Supprimer exercice
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet exercice ?")) return;

    // Rendu optimiste
    setExercises(exercises.filter((ex) => ex._id !== id));

    // Suppression en db
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        setExercises(initialExercises);
        alert("Erreur");
      }
    } catch (error) {
      setExercises(initialExercises);
      alert("Erreur de connexion");
    }
  };

  // Rendu optimiste pour ajout d'exercice (transmis à modale)
  const handleExerciseAdded = (newExercise) => {
    setExercises([...exercises, newExercise]);
  };

  // Rendu optimiste pour modification d'exercice (transmis à modale)
  const handleExerciseUpdated = (updatedExercise) => {
    setExercises(
      exercises.map((ex) =>
        ex._id === updatedExercise._id ? updatedExercise : ex,
      ),
    );
  };

  // RENDER

  return (
    <div>
      {/* ONGLETS */}
      <ExerciseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

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
      {/* BOUTON CRÉER (onglet "Mes exercices") */}
      {activeTab === "mine" && (
        <Button onClick={() => setIsOpen("create")}>
          + Créer un nouvel exercice
        </Button>
      )}
      {/* Modal de création d'exercice */}
      {isOpen === "create" && (
        <Modal onClose={onClose} onExerciseAdded={handleExerciseAdded} />
      )}

      {/* LISTE DES EXERCICES GROUPÉS */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucun exercice</p>
      ) : (
        Object.entries(grouped).map(([muscle, exs]) => (
          <ExerciseGroup
            key={muscle}
            muscle={muscle}
            exercises={exs}
            activeTab={activeTab}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onEdit={handleExerciseUpdated}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}
