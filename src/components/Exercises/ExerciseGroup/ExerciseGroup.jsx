import ExerciseCard from "../ExerciseCard/ExerciseCard";

export default function ExerciseGroup({
  muscle,
  exercises,
  activeTab,
  favorites,
  onToggleFavorite,
  onUpdate,
  onDelete,
}) {
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
            onToggleFavorite={onToggleFavorite}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
