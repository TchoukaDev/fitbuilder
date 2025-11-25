import { ExerciseCard } from ".";
import { useModals } from "@/Providers/Modals";

export default function ExerciseGroup({
  muscle,
  exercises,
  activeTab,
  favorites,
  userId,
  isAdmin,
}) {
  const { openModal } = useModals();
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{muscle}</h2>
      <div className="grid gap-4">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex._id}
            exercise={ex}
            activeTab={activeTab}
            isFavorite={favorites.includes(ex._id)}
            userId={userId}
            isAdmin={isAdmin}
            onEdit={() => openModal("updateExercise", { exercise: ex })}
          />
        ))}
      </div>
    </div>
  );
}
