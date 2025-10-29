"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../Buttons/Button";
import Modal from "../Modal/Modal";

export default function ExercisesList({
  isAdmin = false,
  initialExercises,
  initialFavorites = [],
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'mine', 'favorites'
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [isOpen, setIsOpen] = useState(null);
  const onClose = () => setIsOpen(null);
  const router = useRouter();

  // Muscles uniques
  const muscles = [...new Set(exercises.map((ex) => ex.muscle))].sort();

  const myExercises = isAdmin
    ? exercises.filter((ex) => ex.type === "public") //Si admin, exercices publics
    : exercises.filter((ex) => ex.type === "private"); //Sinon exercices privés

  // Exercices favoris (avec détails complets)
  const favoriteExercises = exercises.filter((ex) =>
    favorites.includes(ex._id),
  );

  // Exercices à afficher selon l'onglet muscle
  let displayedExercises = [];
  if (activeTab === "all") {
    displayedExercises =
      selectedMuscle === "all"
        ? exercises
        : exercises.filter((ex) => ex.muscle === selectedMuscle);
  } else if (activeTab === "mine") {
    displayedExercises = myExercises;
  } else if (activeTab === "favorites") {
    displayedExercises =
      selectedMuscle === "all"
        ? favoriteExercises
        : favoriteExercises.filter((ex) => ex.muscle === selectedMuscle);
  }

  // Grouper par muscle
  const grouped = displayedExercises.reduce((acc, ex) => {
    if (!acc[ex.muscle]) acc[ex.muscle] = [];
    acc[ex.muscle].push(ex);
    return acc;
  }, {});

  // Ajouter/retirer des favoris
  const toggleFavorite = async (exerciseId) => {
    //   Rendu optimiste
    const isFavorite = favorites.includes(exerciseId);
    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== exerciseId)
      : [...favorites, exerciseId];

    setFavorites(newFavorites);

    // Sauvegarder en DB
    await fetch("/api/exercises/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites: newFavorites }),
    });
  };

  // Supprimer un exercice
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet exercice ?")) return;

    //   Rendu optimiste
    setExercises(exercises.filter((ex) => ex._id !== id));

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

  // Ajout optimiste
  const handleExerciseAdded = (newExercise) => {
    setExercises([...exercises, newExercise]);
  };

  // Modification optimiste
  const handleExerciseUpdated = (updatedExercise) => {
    setExercises(
      exercises.map((ex) =>
        ex._id === updatedExercise._id ? updatedExercise : ex,
      ),
    );
  };
  // ✅ Synchroniser le state quand initialExercises change
  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);

  // ✅ Synchroniser les favoris
  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  return (
    <div>
      {/* ONGLETS */}

      {/* Tous les exercices */}
      <div className="flex gap-2.5 mb-8 border-b-2 border-gray-300">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-4 px-8 bg-transparent border-b ${
            activeTab === "all"
              ? "border-b-[3px] border-primary-500 font-bold"
              : "font-normal border-transparent"
          } cursor-pointer transition-all`}
        >
          🏋️ Tous ({exercises.length})
        </button>

        {/* Mes exercices */}
        <button
          onClick={() => setActiveTab("mine")}
          className={`py-4 px-8 bg-transparent border-b  ${
            activeTab === "mine"
              ? "border-b-[3px] border-primary-500 font-bold"
              : "font-normal border-transparent"
          } cursor-pointer transition-all`}
        >
          🔒 Mes exercices ({myExercises.length})
        </button>

        {/* Favoris */}
        <button
          onClick={() => setActiveTab("favorites")}
          className={`py-4 px-8 bg-transparent border-b ${
            activeTab === "favorites"
              ? "border-b-[3px] border-primary-500 font-bold"
              : "font-normal border-transparent"
          } cursor-pointer transition-all`}
        >
          ⭐ Favoris ({favorites.length})
        </button>
      </div>

      {/* FILTRES PAR MUSCLE (pour onglets "Tous" et "Favoris") */}

      {/* Bouton Tous les muscles */}
      {(activeTab === "all" || activeTab === "favorites") && (
        <div className="flex gap-2.5 mb-5 flex-wrap">
          <button
            onClick={() => setSelectedMuscle("all")}
            className={`py-2 px-4 border-none rounded-md cursor-pointer ${
              selectedMuscle === "all"
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Tous
          </button>

          {/* Boutons pour chque muscle */}
          {muscles.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`py-2 px-4 border-none rounded-md cursor-pointer ${
                selectedMuscle === muscle
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
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

      {/* LISTE DES EXERCICES */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucun exercice</p>
      ) : (
        Object.entries(grouped).map(([muscle, exs]) => (
          <div key={muscle} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{muscle}</h2>

            <div className="grid gap-4">
              {exs.map((ex) => (
                <div
                  key={ex._id}
                  className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">
                        {ex.name} {ex.type === "private" && "🔒"}
                      </h3>
                      <p className="text-gray-600 text-sm">📦 {ex.equipment}</p>
                      <p className="text-sm mt-2">{ex.description}</p>
                    </div>

                    <div className="flex gap-2.5 ml-4">
                      {/* FAVORIS (onglets "Tous" et "Mes exercices") */}
                      {(activeTab === "all" || activeTab === "mine") && (
                        <button
                          onClick={() => toggleFavorite(ex._id)}
                          className="bg-transparent border-none text-2xl cursor-pointer hover:scale-110 transition"
                        >
                          {favorites.includes(ex._id) ? "⭐" : "☆"}
                        </button>
                      )}

                      {/* RETIRER DES FAVORIS (onglet "Favoris") */}
                      {activeTab === "favorites" && (
                        <button
                          onClick={() => toggleFavorite(ex._id)}
                          className="py-1 px-2.5 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
                        >
                          ❌ Retirer
                        </button>
                      )}

                      {/* MODIFIER/SUPPRIMER (onglet "Mes exercices") */}
                      {activeTab === "mine" && (
                        <>
                          <Button onClick={() => setIsOpen("update")}>
                            Modifier
                          </Button>
                          {/* Modal de modification d'exercice */}
                          {isOpen === "update" && (
                            <Modal
                              onClose={onClose}
                              onExerciseUpdated={handleExerciseUpdated}
                              exerciseToUpdate={ex}
                            />
                          )}

                          <button
                            onClick={() => handleDelete(ex._id)}
                            className="py-1 px-2.5 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
