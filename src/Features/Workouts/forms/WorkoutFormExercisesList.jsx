// components/Features/Workouts/ExercisesList/ExercisesList.jsx
"use client";

import { Button } from "@/Global/components";
import {
  SquareArrowDown,
  SquareArrowUp,
  SquareX,
  Plus,
  Edit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BeatLoader } from "react-spinners";

export default function WorkoutFormExercisesList({
  exercises,
  isMounted,
  onAddClick,
  onEditClick,
  onRemoveClick,
  onMoveClick,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900">
          Exercices du plan ({exercises.length})
        </h2>

        <Button type="button" onClick={onAddClick}>
          <Plus size={20} />
          Ajouter un exercice
        </Button>
      </div>

      {!isMounted ? (
        <div className="flex justify-center items-center py-12">
          <BeatLoader size={10} color="#7557ff" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            Aucun exercice ajouté pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise._id || exercise.id || index}
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
                    {exercises.length > 1 && (
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
                          disabled={index === exercises.length - 1}
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
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
