"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { SquareArrowDown, SquareArrowUp, SquareX, Edit } from "lucide-react";

/**
 * Affiche une carte d'exercice avec ses informations et ses actions
 * (modifier, supprimer, déplacer).
 *
 * Composant purement présentatif : toute la logique métier reste dans
 * le parent via les callbacks passés en props.
 */
function ExerciseItem({
  exercise,
  index,
  total,
  onEditClick,
  onRemoveClick,
  onMoveClick,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300"
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

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
            <span className="font-medium">
              {exercise.sets} séries × {exercise.reps} reps
            </span>

            <span>
              🏋️{" "}
              {exercise.targetWeight === 0
                ? "Poids du corps"
                : `${exercise.targetWeight} kg`}
            </span>

            {exercise.restTime != null && (
              <span>⏱️ Repos: {exercise.restTime}s</span>
            )}
          </div>

          {exercise.notes && (
            <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded">
              📝 {exercise.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-1">
            {/* Bouton MODIFIER */}
            <button
              type="button"
              onClick={() => onEditClick(exercise, index)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
              title="Modifier l'exercice"
            >
              <Edit size={20} />
            </button>

            {/* Bouton SUPPRIMER */}
            <button
              type="button"
              onClick={() => onRemoveClick(index)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
              title="Retirer l'exercice"
            >
              <SquareX size={20} />
            </button>
          </div>

          {/* Boutons DÉPLACER */}
          {total > 1 && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onMoveClick(index, "up")}
                disabled={index === 0}
                className="p-1 text-primary-600 hover:bg-primary-50 rounded disabled:text-gray-300 disabled:hover:bg-transparent transition cursor-pointer"
                title="Déplacer vers le haut"
              >
                <SquareArrowUp size={20} />
              </button>

              <button
                type="button"
                onClick={() => onMoveClick(index, "down")}
                disabled={index === total - 1}
                className="p-1 text-primary-600 hover:bg-primary-50 rounded disabled:text-gray-300 disabled:hover:bg-transparent transition cursor-pointer"
                title="Déplacer vers le bas"
              >
                <SquareArrowDown size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ExerciseItem);
