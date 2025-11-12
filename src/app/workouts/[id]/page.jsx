import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Layout/Header/Header";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { Calendar, Clock, Dumbbell, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getWorkoutById } from "@/utils/getWorkouts";
import WorkoutDetailDelete from "@/components/Features/Workouts/WorkoutDetailDelete/WorkoutDetailDelete";
import StartWorkoutButton from "@/components/Buttons/StartWorkoutButton";

export default async function WorkoutDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedparams = await params;
  const workoutId = resolvedparams.id;

  // TODO: Récupérer le workout depuis la DB
  const workout = await getWorkoutById(userId, workoutId);
  const serializedWorkout = JSON.parse(JSON.stringify(workout));
  if (!workout) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container mx-auto p-6 max-w-4xl">
        {/* Bouton retour */}
        <Link
          href="/workouts"
          className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-500 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Retour aux plans</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2">
                {workout.name}
              </h1>
              {workout.description && (
                <p className="text-gray-600">{workout.description}</p>
              )}
            </div>

            <span className="px-4 py-2 bg-primary-100 text-primary-700 font-semibold rounded-full">
              {workout.category}
            </span>
          </div>

          {/* Infos rapides */}
          <div className="flex flex-wrap gap-6 text-gray-700 mb-6">
            <div className="flex items-center gap-2">
              <Dumbbell size={20} className="text-primary-600" />
              <span className="font-medium">
                {workout.exercises?.length || 0} exercices
              </span>
            </div>

            {workout.estimatedDuration && (
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-primary-600" />
                <span className="font-medium">
                  {workout.estimatedDuration} min estimées
                </span>
              </div>
            )}

            {workout.timesUsed > 0 && (
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                <span className="font-medium">
                  Réalisé {workout.timesUsed} fois
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 items-center">
            {/* Démarrer la session */}
            <StartWorkoutButton userId={userId} workout={serializedWorkout} />

            {/* Modifier */}
            <Link href={`/workouts/${workout._id}/edit`}>
              <button className="px-4 py-2 flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer">
                <Edit size={18} />
                Modifier
              </button>
            </Link>

            {/* Supprimer */}
            <WorkoutDetailDelete workoutId={workoutId} userId={userId} />
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">
            Exercices
          </h2>

          {workout.exercises?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun exercice dans ce plan
            </p>
          ) : (
            <div className="space-y-4">
              {workout.exercises?.map((exercise, index) => (
                <div
                  key={exercise.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Numéro */}
                    <div className="shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {exercise.order}
                    </div>

                    {/* Infos exercice */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {exercise.name}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="font-medium">
                          {exercise.sets} séries × {exercise.reps} reps
                        </span>

                        {exercise.targetWeight && (
                          <span>🏋️ {exercise.targetWeight} kg</span>
                        )}

                        {exercise.restTime && (
                          <span>⏱️ Repos: {exercise.restTime}s</span>
                        )}
                      </div>

                      {exercise.notes && (
                        <p className="text-sm text-gray-500 italic mt-2 bg-gray-50 p-2 rounded">
                          📝 {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
