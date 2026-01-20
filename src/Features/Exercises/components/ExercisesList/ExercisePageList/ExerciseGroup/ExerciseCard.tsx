"use client";

// Carte d'affichage d'un exercice avec ses actions (favoris, modifier, supprimer)
import { Button, LoaderButton } from "@/Global/components";
import { useToggleFavorite } from "@/Features/Exercises/hooks/useExercises";
import { FaRegStar, FaStar } from "react-icons/fa";
import { Exercise } from "@/types/exercise";

type ExerciseCardProps = {
  exercise: Exercise;
  activeTab: string;
  isFavorite: boolean;
  userId: string;
  onEdit: () => void;
  onDelete: () => void;
}
export default function ExerciseCard({
  exercise,
  activeTab,
  isFavorite,
  userId,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  const { mutate: toggleFavorite, isPending: isToggling } =
    useToggleFavorite(userId);

  return (
    <div className="border border-gray-300 p-4 md:p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-3">
        <div className="flex justify-between gap-2 flex-1 items-center">
          {/* Informations de l'exercice */}
          <div className="flex-1">
            <h3 className="text-lg font-bold">
              {exercise.name} {exercise.isPublic === false && "🗒️"}
            </h3>
            <p className="text-gray-600 text-sm ml-3"> {exercise.equipment}</p>
            <p className="text-sm mt-2 line-clamp-3 md:line-clamp-none">
              {exercise.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex self-center gap-2.5 ml-4">
            {/* Bouton favoris (onglets "Tous" et "Mes exercices") */}
            {(activeTab === "all" || activeTab === "mine") && (
              <button
                onClick={() =>
                  toggleFavorite({ exerciseId: exercise.id, isFavorite })
                }
                disabled={isToggling}
                className="bg-transparent border-none text-2xl cursor-pointer hover:scale-110 transition"
                title={
                  isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
                }
              >
                {isFavorite ? <FaStar color="F5DF14" /> : <FaRegStar />}
              </button>
            )}
          </div>
        </div>
        {/* Retirer des favoris (onglet "Favoris") */}
        {activeTab === "favorites" && (
          <div className="flex">
            <LoaderButton
              close
              isLoading={isToggling}
              loadingText="Retrait en cours"
              type="button"
              disabled={isToggling}
              onClick={() =>
                toggleFavorite({ exerciseId: exercise.id, isFavorite })
              }
              aria-label="Retirer des favoris"
            >
              Retirer des favoris
            </LoaderButton>
          </div>
        )}

        {/* Modifier/Supprimer (onglet "Mes exercices") */}
        {activeTab === "mine" && (
          <div className="flex gap-2">
            <Button onClick={onEdit}>Modifier</Button>
            <Button onClick={onDelete} close>
              Supprimer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
