// components/Features/Workouts/ExercisesList/ExercisesList.jsx
"use client";

// Bloc de formulaire qui affiche et gère la liste des exercices du plan.
import { Button } from "@/Global/components";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { BeatLoader } from "react-spinners";
import ExerciseItem from "./ExerciseItem";
import { useWorkoutStore } from "@/Features/Workouts/store";

export default function WorkoutFormExercisesList({
  onAddClick,
  onEditClick,
  onRemoveClick,
}) {
  const exercisesStore = useWorkoutStore((state) => state.exercises);
  const isMounted = useWorkoutStore((state) => state.isMounted);
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900">
          Exercices du plan ({exercisesStore.length})
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
      ) : exercisesStore.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            Veuillez ajouter au moins un exercice
            <span className="text-accent-500">*</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {exercisesStore.map((exercise, index) => (
              <ExerciseItem
                key={exercise._id || exercise.id || index}
                index={index}
                total={exercisesStore.length}
                onEditClick={onEditClick}
                onRemoveClick={onRemoveClick}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
