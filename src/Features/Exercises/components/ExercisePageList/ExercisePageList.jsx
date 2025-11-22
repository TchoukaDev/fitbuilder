import ExerciseTabs from "../ExerciseTabs/ExerciseTabs";
import Button from "@/Global/components/ui/Button";
import MuscleFilters from "../MusclesFilters/MuscleFilters";
import ExerciseGroup from "../ExerciseGroup/ExerciseGroup";
import { useModals } from "@/Providers/Modals/ModalContext";
import NewExerciseModal from "../../modals/NewExerciseModal";

export default function ExercisePageList({
  activeTab,
  setActiveTab,
  counts,
  allExerciseMuscles,
  selectedMuscle,
  setSelectedMuscle,
  myExerciseMuscles,
  favoriteExerciseMuscles,
  grouped,
  favorites,
  userId,
  isAdmin,
}) {
  const { isOpen, openModal } = useModals();
  return (
    <div>
      {/* ONGLETS */}
      <ExerciseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />{" "}
      {/* BOUTON CRÉER (onglet "Mes exercices") */}
      {activeTab === "mine" && (
        <div className="mb-5">
          <Button onClick={() => openModal("newExercise")}>
            + Créer un nouvel exercice
          </Button>
        </div>
      )}
      {/* Modal de création d'exercice */}
      {isOpen("newExercise") && <NewExerciseModal />}
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
