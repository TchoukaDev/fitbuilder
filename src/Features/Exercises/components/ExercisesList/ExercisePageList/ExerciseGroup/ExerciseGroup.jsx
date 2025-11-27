// Groupe d'exercices affichés sous un titre de muscle
import { ExerciseCard } from ".";
import { useModals } from "@/Providers/Modals";

export default function ExerciseGroup({
  muscle,
  exercises,
  activeTab,
  favoritesExercises,
  userId,
  isAdmin,
}) {
  const { openModal } = useModals();

  return (
    <div className="mb-10">
      {/* Titre du groupe musculaire */}
      <h2 className="text-2xl font-bold mb-4">{muscle}</h2>

      {/* Liste des exercices */}
      <div className="grid gap-4">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex._id}
            exercise={ex}
            activeTab={activeTab}
            isFavorite={favoritesExercises.includes(ex._id)}
            userId={userId}
            isAdmin={isAdmin}
            onEdit={() => openModal("updateExercise", { exercise: ex })}
            onDelete={() => openModal("deleteConfirm", { id: ex._id })}
          />
        ))}
      </div>
    </div>
  );
}
