"use client";

import Button from "@/components/Buttons/Button";
import { useDeleteWorkout, useUpdateWorkout } from "@/hooks/useWorkouts";
import { Calendar, Clock, Dumbbell, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function WorkoutTemplateCard({ workout, onUpdate, userId }) {
  const { mutate: deleteWorkout, isPending } = useDeleteWorkout(userId);
  const { mutate: updateWorkout, isPending: isUpdating } =
    useUpdateWorkout(userId);
  const date = new Date(workout.createdAt);
  const workoutDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "2-digit",
    year: "2-digit",
  });

  const handleDelete = () => {
    if (!confirm(`Supprimer "${workout.name}" ?`)) return;
    deleteWorkout(workout._id, {
      onError: (err) => toast.error(err),
    });
  };

  const handleUpdate = () => {};

  return (
    <div className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link href={`/workouts/${workout._id}`}>
            <h3 className="text-xl font-bold text-primary-700 hover:text-primary-500 cursor-pointer">
              {workout.name}
            </h3>
          </Link>
          {workout.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {workout.description}
            </p>
          )}
        </div>

        {/* Badge catégorie */}
        <div className="flex gap-3 items-center text-gray-600">
          <span className="text-sm">Créé le {workoutDate}</span>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full ml-3">
            {workout.category}
          </span>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Dumbbell size={16} />
          <span>{workout.exercises?.length || 0} exercices</span>
        </div>

        {workout.estimatedDuration && (
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{workout.estimatedDuration} min</span>
          </div>
        )}

        {workout.timesUsed > 0 && (
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>Utilisé {workout.timesUsed}x</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <Link href={`/workouts/${workout._id}`} className="flex-1">
          <Button className="w-full">Voir le détail</Button>
        </Link>

        <Link
          href={`/workouts/${workout._id}/edit`}
          className="LinkButton"
          title="Modifier"
        >
          <Edit size={20} />
        </Link>

        <Button
          disabled={isPending}
          close
          onClick={handleDelete}
          title="Supprimer"
        >
          <Trash2 size={20} />
        </Button>
      </div>
    </div>
  );
}
