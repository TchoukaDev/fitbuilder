"use client";

// Page client qui affiche le détail d'un plan d'entraînement et ses exercices.
import { Button, DeleteConfirmModal } from "@/Global/components";
import { WorkoutDeleteButton, StartWorkoutButton } from "..";
import Link from "next/link";
import { Calendar, Clock, Dumbbell, Edit, ArrowLeft } from "lucide-react";
import { useDeleteWorkout } from "../../hooks";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { WorkoutExerciseItem } from ".";

export default function WorkoutDetailPageClient({
  userId,
  workout,
  workoutId,
}) {
  const { mutate: deleteWorkout, isPending } = useDeleteWorkout(userId);
  const { isOpen, closeModal } = useModals();
  const router = useRouter();

  const handleDelete = async () => {
    deleteWorkout(workoutId, {
      onSuccess: () => {
        router.push("/workouts");
        router.refresh();
        closeModal("deleteConfirm");
      },
      onError: () => {
        toast.error("Erreur lors de la suppression");
      },
    });
  };
  const title = "Supprimer l'entraînement";
  const message = "Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ?";
  return (
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
                {workout.estimatedDuration} min
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
          <StartWorkoutButton userId={userId} workout={workout} />

          {/* Modifier */}
          <Link href={`/workouts/${workout._id}/edit`}>
            <Button edit>
              <Edit size={18} />
              Modifier
            </Button>
          </Link>

          {/* Supprimer */}
          <WorkoutDeleteButton workoutId={workoutId} />
        </div>
      </div>
      {/* Modale de suppression */}
      {isOpen("deleteConfirm") && (
        <DeleteConfirmModal
          title={title}
          message={message}
          onConfirm={handleDelete}
          isLoading={isPending}
        />
      )}

      {/* Liste des exercices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-primary-900 mb-4">Exercices</h2>

        {workout.exercises?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun exercice dans ce plan
          </p>
        ) : (
          <div className="space-y-4">
            {workout.exercises?.map((exercise, index) => (
              <WorkoutExerciseItem
                key={exercise._id || exercise.id || index}
                exercise={exercise}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
