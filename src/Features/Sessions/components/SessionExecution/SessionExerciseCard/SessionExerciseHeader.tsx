"use client";

import { memo } from "react";
import { CheckCircle, Circle, Timer } from "lucide-react";
import { SessionExercise } from "@/types/SessionExercise";

/**
 * En-tête de la carte d'exercice
 * Affiche : icône de statut, nom, cibles, badges et bouton timer
 * ✅ Mémorisé car dans une liste (SessionExerciseCard[] memo)
 */
interface SessionExerciseHeaderProps {
  exercise: SessionExercise;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRestTimer: () => void;
}

const SessionExerciseHeader = memo(function SessionExerciseHeader({
  exercise,
  isActive,
  isExpanded,
  onToggleExpand,
  onRestTimer,
}: SessionExerciseHeaderProps) {
  return (
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={onToggleExpand}
    >
      {/* Infos de l'exercice */}
      <div
        className={`flex items-center gap-3 ${exercise.completed ? "opacity-60" : ""
          }`}
      >
        {/* Icône de statut */}
        {exercise.completed ? (
          <CheckCircle className="text-green-600" size={24} />
        ) : (
          <Circle className="text-gray-400" size={24} />
        )}

        {/* Nom et infos de l'exercice */}
        <div>
          <h3 className="font-semibold text-lg">{exercise.exerciseName}</h3>
          <p className="text-sm text-gray-600">
            {exercise.targetSets} × {exercise.targetReps} reps
            {` - ${exercise.targetWeight === 0 ? "Poids du corps" : `${exercise.targetWeight} kg`}
          `}
          </p>

          {/* Badges de statut */}
          <div className="flex items-center gap-2 mt-1">
            {/* Badge de statut */}
            {exercise.completed ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block shrink-0">
                ✅ Terminé
              </span>
            ) : isActive ? (
              <span className="text-xs bg-accent-100 text-accent-500 px-2 py-1 rounded inline-block shrink-0">
                ⌛ En cours
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded inline-block shrink-0">
                ❌ En attente
              </span>
            )}

            {/* ✅ BOUTON TIMER */}
            {!exercise.completed && isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestTimer();
                }}
                className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-2.5 py-1 rounded-full md:rounded inline-flex items-center gap-1.5 transition shadow-sm hover:shadow-md cursor-pointer di"
                disabled={!isActive}
                title="Démarrer le timer de repos"
              >
                <Timer size={13} />
                <span className="hidden md:inline">Démarrer le timer</span>
                <span className="font-semibold">
                  {exercise.restTime || 90}s
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2"></div>

      {/* Flèche */}
      <span className={`text-2xl ${isExpanded ? "" : "-rotate-90"} transition`}>
        ▼
      </span>
    </div>
  );
});

export default SessionExerciseHeader;
