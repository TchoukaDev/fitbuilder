"use client";

import { useEffect, useState } from "react";
import { SetRow } from "..";
import { Button } from "@/Global/components";
import { motion } from "framer-motion";
import { handleKeyDown } from "@/Global/utils";
import { useSessionStore } from "@/Features/Sessions/store";
import { SessionExercise } from "@/types/SessionExercise";

interface CurrentExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  isActive: boolean;
  onCompleteExercise: (exerciseIndex: number) => void;
}

/**
 * Formulaire de l'exercice en cours
 * Affiche : séries, effort/RPE, notes et bouton pour terminer
 */
export default function CurrentExerciseCard({
  exercise,
  index,
  isActive,
  onCompleteExercise,
}: CurrentExerciseCardProps) {
  // ✅ Appeler directement les actions du store
  const updateExerciseSet = useSessionStore((state) => state.updateExerciseSet);
  const toggleExerciseSetComplete = useSessionStore(
    (state) => state.toggleExerciseSetComplete,
  );
  const updateExerciseNotes = useSessionStore(
    (state) => state.updateExerciseNotes,
  );
  const updateExerciseEffort = useSessionStore(
    (state) => state.updateExerciseEffort,
  );

  // ✅ State local pour l'effort (RPE)
  const [localEffort, setLocalEffort] = useState(exercise.effort ?? null);
  // ✅ Synchroniser quand exercise.effort change
  useEffect(() => {
    setLocalEffort(exercise.effort ?? null);
  }, [exercise.effort]);

  // ✅ Notation de l'effort (RPE) - Validation locale
  const handleChangeEffort = (value: string) => {
    const numValue = value === "" ? null : parseInt(value);
    if (numValue === null || (numValue >= 1 && numValue <= 10)) {
      setLocalEffort(numValue);
      updateExerciseEffort(index, numValue);
    }
  };

  return (

    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 space-y-7"
    >
      {/* Afficher les séries */}
      {Array.from({ length: exercise.targetSets }, (_, i) => i).map(
        (setIndex) => (
          <SetRow
            key={setIndex}
            setIndex={setIndex}
            isActive={isActive}
            setData={exercise.actualSets[setIndex]}
            onSetChange={(field, value) =>
              updateExerciseSet(index, setIndex, field, value as number | undefined)
            }
            onSetComplete={() => toggleExerciseSetComplete(index, setIndex)}
          />
        ),
      )}

      {/* ✅ EFFORT / RPE */}
      <div className="mt-4">
        <label
          htmlFor={`effort-${index}`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          💪 Effort ressenti (RPE)
          <span className="text-gray-500 text-xs ml-2">(1-10)</span>
        </label>

        {/* INPUT RPE */}
        <div className="flex items-center justify-center gap-3">
          <input
            id={`effort-${index}`}
            type="number"
            inputMode="numeric"
            onKeyDown={handleKeyDown}
            min="1"
            max="10"
            disabled={!isActive}
            required
            value={localEffort ?? ""}
            onChange={(e) => handleChangeEffort(e.target.value)}
            className="input w-24 text-center pt-2 bg-white text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <div className="text-xs text-gray-500">
            {localEffort === null || localEffort === undefined ? (
              <span className="italic">Non renseigné</span>
            ) : localEffort <= 3 ? (
              <span className="text-green-600">Très facile</span>
            ) : localEffort <= 6 ? (
              <span className="text-primary-600">Modéré</span>
            ) : localEffort <= 8 ? (
              <span className="text-accent-600">Intense</span>
            ) : (
              <span className="text-red-600">Maximum</span>
            )}
          </div>
        </div>

        {/* Légende de l'effort (RPE) */}
        <div className="mt-2 text-xs text-center text-gray-400 space-y-1">
          <p>
            1-3 = Très facile • 4-6 = Modéré • 7-8 = Intense • 9-10 = Maximum
          </p>
        </div>
      </div>

      {/* ✅ NOTES */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 Commentaires (optionnel)
        </label>
        <textarea
          value={exercise.notes || ""}
          disabled={!isActive}
          onChange={(e) => updateExerciseNotes(index, e.target.value)}
          placeholder="Ex: Forme excellente, j'ai augmenté le poids..."
          className="input w-full p-2 md:p-4 text-xs md:text-sm bg-white placeholder:text-xs md:placeholder:text-base placeholder:text-primary-300 placeholder:font-light disabled:opacity-50 disabled:cursor-not-allowed"
          rows={2}
        />
      </div>

      {/* BOUTON TERMINER */}
      <Button full onClick={() => onCompleteExercise(index)}>
        Exercice terminé
      </Button>
    </motion.div>

  );
}
