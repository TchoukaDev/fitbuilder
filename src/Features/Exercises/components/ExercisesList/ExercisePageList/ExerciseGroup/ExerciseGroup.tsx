// Groupe d'exercices affichés sous un titre de muscle
import { Exercise } from "@/types/exercise";
import { ExerciseCard } from ".";
import { useModals } from "@/Providers/Modals";


type ExerciseGroupProps = {
  muscle: string;
  exercises: Exercise[];
  activeTab: string;
  favoritesExercises: string[];
  userId: string;
}
export default function ExerciseGroup({
  muscle,
  exercises,
  activeTab,
  favoritesExercises,
  userId,
}: ExerciseGroupProps) {
  const { openModal } = useModals();

  return (
    <div className="mb-10">
      {/* Titre du groupe musculaire */}
      <h2 className="text-2xl font-bold mb-4">{muscle}</h2>

      {/* Liste des exercices */}
      <div className="grid gap-4">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            activeTab={activeTab}
            isFavorite={favoritesExercises.includes(ex.id)}
            userId={userId}
            onEdit={() => openModal("updateExercise", { exercise: ex })}
            onDelete={() => openModal("deleteConfirm", { id: ex.id })}
          />
        ))}
      </div>
    </div>
  );
}
