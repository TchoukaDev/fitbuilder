"use client";

// Page de liste des exercices avec onglets, filtres, modals et actions
import { Button, DeleteConfirmModal } from "@/Global/components";
import { MuscleSelectGroup } from "@/Features/Exercises/hooks/useExerciseFilters";
import { ExerciseGroup } from ".";
import {
  NewExerciseModal,
  UpdateExerciseModal,
} from "@/Features/Exercises/modals";
import { useModals } from "@/Providers/Modals";
import { ExerciseMuscleFilters, ExerciseTabs } from ".";
import { useDeleteExercise } from "@/Features/Exercises/hooks";
import { Exercise } from "@/types/exercise";
import { useEffect } from "react";


type ExercisePageListProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts: { all: number; mine: number; favorites: number };
  allExerciseMuscles: string[];
  selectedMuscle: string;
  setSelectedMuscle: (muscle: string) => void;
  selectedSecondaryMuscle: string;
  setSelectedSecondaryMuscle: (muscle: string) => void;
  muscleSelectGroups: MuscleSelectGroup[];
  myExerciseMuscles: string[];
  favoriteExerciseMuscles: string[];
  grouped: Record<string, Exercise[]>;
  favoritesExercises: string[];
  userId: string;
  isAdmin: boolean;
}

export default function ExercisePageList({
  activeTab,
  setActiveTab,
  counts,
  allExerciseMuscles,
  selectedMuscle,
  setSelectedMuscle,
  selectedSecondaryMuscle,
  setSelectedSecondaryMuscle,
  muscleSelectGroups,
  myExerciseMuscles,
  favoriteExerciseMuscles,
  grouped,
  favoritesExercises,
  userId,
  isAdmin,
}: ExercisePageListProps) {
  const { isOpen, openModal, getModalData, closeModal } = useModals();

  const { mutate: deleteExercise, isPending: isDeleting } = useDeleteExercise(
    { userId, isAdmin },
  );

  const title = "Retirer l'exercice";
  const message = "Souhaitez-vous retirer cet exercice du programme?";

  const handleModalConfirm = () => {
    deleteExercise(getModalData<{ exerciseId: string | undefined }>("deleteConfirm")?.exerciseId || "");
    closeModal("deleteConfirm");
  };

  // Si le muscle sélectionné n'a pas d'exercices, on réinitialise le muscle sélectionné 
  useEffect(() => {
    if ((grouped)[selectedMuscle]?.length === 0 && selectedMuscle !== "all") {
      setSelectedMuscle("all");
    }
  }, [grouped, selectedMuscle]);


  return (
    <div className="overflow-hidden px-1">
      {/* Onglets de navigation */}
      <ExerciseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        setSelectedMuscle={setSelectedMuscle}
      />

      {/* Bouton de création (onglet "Mes exercices") */}
      {activeTab === "mine" && (
        <div className="mb-5">
          <Button onClick={() => openModal("newExercise")}>
            + Créer un nouvel exercice
          </Button>
        </div>
      )}

      {/* Modals */}
      {isOpen("newExercise") && <NewExerciseModal />}
      {isOpen("updateExercise") && (
        <UpdateExerciseModal
          exerciseToUpdate={getModalData<{ exercise: Exercise }>("updateExercise")?.exercise}
        />
      )}
      {isOpen("deleteConfirm") && (
        <DeleteConfirmModal
          title={title}
          message={message}
          isLoading={isDeleting}
          onConfirm={handleModalConfirm}
        />
      )}

      {/* Filtres par muscle selon l'onglet actif */}
      {activeTab === "all" && (
        <ExerciseMuscleFilters
          muscles={allExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
        />
      )}
      {activeTab === "mine" && (
        <ExerciseMuscleFilters
          muscles={myExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
        />
      )}
      {activeTab === "favorites" && (
        <ExerciseMuscleFilters
          muscles={favoriteExerciseMuscles}
          selectedMuscle={selectedMuscle}
          onMuscleChange={setSelectedMuscle}
        />
      )}

      {/* Filtre par muscle principal granulaire */}
      {muscleSelectGroups.length > 0 && (
        <div className="mb-5">
          <select
            className="input py-2 peer"
            value={selectedSecondaryMuscle}
            onChange={(e) => setSelectedSecondaryMuscle(e.target.value)}
            aria-label="Filtrer par muscle principal"
          >
            <option value="all">-- Tous les muscles --</option>
            {muscleSelectGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.muscles.map(({ name, count }) => (
                  <option key={name} value={name}>{name} ({count})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Liste des exercices groupés par muscle */}
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
            favoritesExercises={favoritesExercises}
            userId={userId}
          />
        ))
      )}
    </div>
  );
}