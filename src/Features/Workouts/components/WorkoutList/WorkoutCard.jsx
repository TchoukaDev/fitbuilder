"use client";

// Carte d'affichage d'un plan d'entraînement dans la liste avec ses informations et actions.
import { Button } from "@/Global/components";
import StartWorkoutButton from "../Buttons/StartWorkoutButton";
import { Calendar, Clock, Dumbbell, Edit, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { WorkoutDeleteButton } from "../Buttons";

export default function WorkoutCard({ workout, userId }) {
  const date = new Date(workout.createdAt);
  const workoutDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <Link href={`/workouts/${workout._id}`}>
            <h3 className="text-xl font-bold text-primary-700 hover:text-primary-500 cursor-pointer">
              {workout.name}
            </h3>
          </Link>
          {workout.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 md:line-clamp-none">
              {workout.description}
            </p>
          )}
        </div>

        {/* Badge catégorie */}
        <div className="flex gap-3 items-center text-gray-600 shrink-0">
          <span className="hidden md:block text-sm">Créé le {workoutDate}</span>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full ml-3 truncate max-w-[150px] shrink-0">
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
            <span>Réalisé {workout.timesUsed}x</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t flex-wrap justify-center md:justify-start  border-gray-200">
        <div className="md:flex-1">
          <Button
            asChild
            title="Voir les détails"
            label="Voir les détails de l'entraînement"
            width="w-12 md:w-fit"
          >
            <Link href={`/workouts/${workout._id}`}>
              <Search />
              <span className="hidden md:inline">Voir les détails</span>
            </Link>
          </Button>
        </div>
        <StartWorkoutButton userId={userId} workout={workout} />
        <Button width="w-12 md:w-auto" asChild edit>
          <Link href={`/workouts/${workout._id}/edit`}>
            <Edit size={18} />
            <span className="hidden md:inline">Modifier</span>
          </Link>
        </Button>

        <WorkoutDeleteButton workoutId={workout._id} sm />
      </div>
    </div>
  );
}
