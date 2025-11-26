// components/Features/Workouts/ExercisesList/ExercisesList.jsx
"use client";

import { Button } from "@/Global/components";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { BeatLoader } from "react-spinners";
import ExerciseItem from "./ExerciseItem";

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
              <ExerciseItem
                key={exercise._id || exercise.id || index}
                exercise={exercise}
                index={index}
                total={exercises.length}
                onEditClick={onEditClick}
                onRemoveClick={onRemoveClick}
                onMoveClick={onMoveClick}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
