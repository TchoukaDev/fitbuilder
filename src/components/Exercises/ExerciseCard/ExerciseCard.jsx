import Button from "@/components/Buttons/Button";
import Modal from "@/components/Modal/Modal";
import { useState } from "react";

export default function ExerciseCard({
  exercise,
  activeTab,
  onToggleFavorite,
  isFavorite,
  onDelete,
  onEdit,
}) {
  const [isOpen, setIsOpen] = useState(null);
  const onClose = () => setIsOpen(null);
  return (
    <div className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold">
            {exercise.name} {exercise.type === "private" && "🔒"}
          </h3>
          <p className="text-gray-600 text-sm">📦 {exercise.equipment}</p>
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
              {isFavorite ? "⭐" : "☆"}
            </button>
          )}

          {/* RETIRER DES FAVORIS (onglet "Favoris") */}
          {activeTab === "favorites" && (
            <button
              onClick={() => onToggleFavorite(exercise._id)}
              className="py-1 px-2.5 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
            >
              ❌ Retirer
            </button>
          )}

          {/* MODIFIER/SUPPRIMER (onglet "Mes exercices") */}
          {activeTab === "mine" && (
            <>
              <Button onClick={() => setIsOpen("update")}>Modifier</Button>
              {/* Modal de modification d'exercice */}
              {isOpen === "update" && (
                <Modal
                  onClose={onClose}
                  onExerciseUpdated={onEdit}
                  exerciseToUpdate={exercise}
                />
              )}

              <button
                onClick={() => onDelete(exercise._id)}
                className="py-1 px-2.5 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
