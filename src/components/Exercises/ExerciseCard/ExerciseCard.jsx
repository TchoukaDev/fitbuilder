import Button from "@/components/Buttons/Button";
import ExerciseModal from "@/components/Modals/ExerciseModal/ExerciseModal";

import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

export default function ExerciseCard({
  exercise,
  activeTab,
  onToggleFavorite,
  isFavorite,
  onDelete,
  onUpdate,
}) {
  const [isOpen, setIsOpen] = useState(null);
  const onClose = () => setIsOpen(null);
  return (
    <div className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold">
            {exercise.name} {exercise.type === "private" && "🗒️"}
          </h3>
          <p className="text-gray-600 text-sm ml-3"> {exercise.equipment}</p>
          <p className="text-sm mt-2">{exercise.description}</p>
        </div>

        <div className="flex gap-2.5 ml-4">
          {/* FAVORIS (onglets "Tous" et "Mes exercices") */}
          {(activeTab === "all" || activeTab === "mine") && (
            <button
              onClick={() => onToggleFavorite(exercise._id)}
              className="bg-transparent border-none text-2xl cursor-pointer hover:scale-110 transition"
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isFavorite ? <FaStar color="F5DF14" /> : <FaRegStar />}
            </button>
          )}

          {/* RETIRER DES FAVORIS (onglet "Favoris") */}
          {activeTab === "favorites" && (
            <Button close onClick={() => onToggleFavorite(exercise._id)}>
              Retirer des favoris
            </Button>
          )}

          {/* MODIFIER/SUPPRIMER (onglet "Mes exercices") */}
          {activeTab === "mine" && (
            <>
              <Button onClick={() => setIsOpen("update")}>Modifier</Button>
              {/* Modal de modification d'exercice */}
              {isOpen === "update" && (
                <ExerciseModal
                  onClose={onClose}
                  onExerciseUpdated={onUpdate}
                  exerciseToUpdate={exercise}
                />
              )}
              {/* Supprimer exercice */}
              <Button onClick={() => onDelete(exercise._id)} close>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
