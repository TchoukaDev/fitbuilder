"use client";

import { memo, useCallback, useEffect, useState } from "react";

import {
  SessionExerciseHeader,
  CompleteExerciseCard,
  CurrentExerciseCard,
} from ".";
import { SessionExercise } from "@/types/SessionExercise";


// Carte d'un exercice pendant l'exécution de la session
interface SessionExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  isActive: boolean;
  onOpenRestTimer: (modalName: string, data: any) => void;
  onCompleteExercise: (exerciseIndex: number) => void;
}

const SessionExerciseCard = memo(function SessionExerciseCard({
  exercise,
  index,
  isActive,
  onOpenRestTimer,
  onCompleteExercise,
}: SessionExerciseCardProps) {
  // ✅ Appeler directement depuis le store si besoin

  const [isExpanded, setIsExpanded] = useState(isActive); //Pour ouvrir/fermer le formulaire des séries

  // Ouvrir le détail de l'exercice actif
  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  // ✅ Stabiliser les callbacks pour SessionExerciseHeader (memo)
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleRestTimerClick = useCallback(() => {
    onOpenRestTimer("restTimer", { restTime: exercise.restTime });
  }, [onOpenRestTimer, exercise.restTime]);

  /*------------------
  RENDER
 ------------------- */

  return (
    <>
      {/* Carte de l'exercice */}
      <div
        className={`
      border rounded-lg p-4 transition-all
      ${isActive ? "border-primary-500 bg-primary-50" : "border-gray-300"}
    
    `}
      >
        {/* Header de l'exercice */}
        <SessionExerciseHeader
          exercise={exercise}
          isActive={isActive}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
          onRestTimer={handleRestTimerClick}
        />

        {/* ═══════════════════════════════════════════════════════ */}
        {/* DÉTAIL SI COMPLÉTÉ : Afficher résumé + bouton réouvrir */}
        {/* ═══════════════════════════════════════════════════════ */}

        {isExpanded && exercise.completed && (
          <CompleteExerciseCard exercise={exercise} index={index} />
        )}

        {/* Détail des séries (déplié) */}
        {isExpanded && !exercise.completed && (
          <CurrentExerciseCard
            exercise={exercise}
            index={index}
            isActive={isActive}
            onCompleteExercise={onCompleteExercise}
          />
        )}

      </div>
    </>
  );
});

export default SessionExerciseCard;
