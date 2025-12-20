"use client";

// Affiche une carte d'exercice dans le détail d'un plan d'entraînement.
export default function WorkoutExerciseItem({ exercise }) {
  return (
    <div className="border border-gray-200 rounded-lg p-2 md:p-4 hover:border-primary-300 transition overflow-hidden">
      <div className="flex items-start gap-3 md:gap-4">
        {/* Numéro */}
        <div className="shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
          {exercise.order}
        </div>

        {/* Infos exercice */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {exercise.name}
          </h3>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="font-medium">
              {exercise.sets} séries × {exercise.reps} reps
            </span>

            <span>🏋️ {exercise.targetWeight} kg</span>

            {exercise.restTime && <span>⏱️ Repos: {exercise.restTime}s</span>}
          </div>

          {exercise.notes && (
            <p className="text-sm text-gray-500 italic mt-2 bg-gray-50 p-2 rounded">
              📝 {exercise.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
