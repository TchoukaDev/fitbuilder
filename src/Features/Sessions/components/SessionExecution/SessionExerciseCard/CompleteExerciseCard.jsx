"use client";

import { useCallback } from "react";
import { Button } from "@/Global/components";
import { useSessionStore } from "@/Features/Sessions/store";

/**
 * Carte de résumé d'un exercice complété
 * Affiche : séries réalisées, notes, effort et bouton pour réouvrir
 */
//
export default function CompleteExerciseCard({
  exercise,
  index,
}) {
  // ✅ Appeler directement l'action du store
  const reopenExercise = useSessionStore((state) => state.reopenExercise);

  // ✅ Mémoriser le callback
  const handleReopenClick = useCallback(() => {
    reopenExercise(index);
  }, [reopenExercise, index]);
  return (
    <>
      <div
        className={`mt-4 space-y-3 border-t pt-4 ${
          exercise.completed ? "opacity-60" : ""
        }`}
      >
        {/* Résumé des séries */}
        <div>
          <p className="font-semibold mb-2">Séries réalisées :</p>
          {exercise.actualSets?.map((set, setIndex) => (
            <p key={setIndex} className="text-sm text-gray-700">
              Série {setIndex + 1}: {set.weight}kg × {set.reps} reps
              {set.completed && " ✓"}
            </p>
          ))}
        </div>

        {/* Notes */}
        {exercise.notes && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm font-medium text-gray-700">📝 Notes :</p>
            <p className="text-sm text-gray-600">{exercise.notes}</p>
          </div>
        )}

        {/* Effort */}
        {exercise.effort && (
          <div>
            <p className="text-sm font-medium text-gray-700">
              💪 Effort : {exercise.effort}/10
            </p>
          </div>
        )}
      </div>

      {/* ✅ BOUTON RÉOUVRIR  */}
      <div className="my-3">
        <Button onClick={handleReopenClick}>🔄 Réouvrir cet exercice</Button>
      </div>
    </>
  );
}
