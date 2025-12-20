import Link from "next/link";
import { Button } from "@/Global/components";

export default function FavoriteWorkoutCard({ workout }) {
  if (!workout) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ⭐ Plan d'entraînement favori
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Aucun plan d'entraînement utilisé
          </p>
          <div className="flex justify-center">
            <Button width="w-fit" asChild>
              <Link href="/workouts/create">Créer un plan d'entraînement</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        ⭐ Plan d'entraînement favori
      </h2>

      <div className="bg-white rounded-lg p-4 border border-purple-200">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{workout.name}</h3>
            {workout.description && (
              <p className="text-sm text-gray-600 mt-1">
                {workout.description}
              </p>
            )}
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full shrink-0">
            {workout.category}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {workout.timesUsed}
            </p>
            <p className="text-xs text-gray-600">utilisations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {workout.exercises?.length || 0}
            </p>
            <p className="text-xs text-gray-600">exercices</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {workout.estimatedDuration}
            </p>
            <p className="text-xs text-gray-600">minutes</p>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Button asChild>
            <Link href={`/workouts/${workout._id}`}>Voir le plan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
