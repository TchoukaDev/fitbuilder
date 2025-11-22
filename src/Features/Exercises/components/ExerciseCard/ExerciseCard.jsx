"use client";
import Button from "@/Global/components/ui/Button";
import { useModals } from "@/Providers/Modals/ModalContext";
import {
  useDeleteExercise,
  useToggleFavorite,
} from "@/Features/Exercises/hooks/useExercises";

import { FaRegStar, FaStar } from "react-icons/fa";
import UpdateExerciseModal from "../../modals/UpdateExerciseModal";

export default function ExerciseCard({
  exercise,
  activeTab,
  isFavorite,
  userId,
  isAdmin,
}) {
  // Modale
  const { isOpen, openModal } = useModals();

  // Gestion des favoris
  const { mutate: toggleFavorite, isPending: isToggling } =
    useToggleFavorite(userId);

  // Supprimer exercice
  const { mutate: deleteExercise, isPending: isDeleting } = useDeleteExercise(
    userId,
    isAdmin,
  );

  const onDelete = (id) => {
    if (!confirm("Voulez-vous supprimer cet exercice?")) {
      return;
    } else deleteExercise(id);
  };

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
              onClick={() =>
                toggleFavorite({ exerciseId: exercise._id, isFavorite })
              }
              disabled={isToggling}
              className="bg-transparent border-none text-2xl cursor-pointer hover:scale-110 transition"
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isFavorite ? <FaStar color="F5DF14" /> : <FaRegStar />}
            </button>
          )}

          {/* RETIRER DES FAVORIS (onglet "Favoris") */}
          {activeTab === "favorites" && (
            <Button
              close
              onClick={() =>
                toggleFavorite({ exerciseId: exercise._id, isFavorite })
              }
            >
              Retirer des favoris
            </Button>
          )}

          {/* MODIFIER/SUPPRIMER (onglet "Mes exercices") */}
          {activeTab === "mine" && (
            <>
              <Button onClick={() => openModal("updateExercise")}>
                Modifier
              </Button>
              {/* Modal de modification d'exercice */}
              {isOpen("updateExercise") && (
                <UpdateExerciseModal exerciseToUpdate={exercise} />
              )}
              {/* Supprimer exercice */}
              <Button
                disabled={isDeleting}
                onClick={() => onDelete(exercise._id)}
                close
              >
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
