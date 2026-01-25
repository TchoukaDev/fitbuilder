"use client";
import { useEffect, useState } from "react";
import { useModals } from "@/Providers/Modals";
import { toast } from "react-toastify";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { Exercise } from "@/types/exercise";
import { WorkoutExerciseForm } from "../../forms";

export interface WorkoutExerciseFormData {
  sets: number;
  reps: number;
  targetWeight: number;
  restTime: number;
  notes: string;
}

export default function ExerciseConfiguration({ exerciseSelected }: { exerciseSelected: Exercise }) {
  const { closeModal } = useModals();
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const setStepAction = useWorkoutStore((state) => state.setStep);
  const clearAll = useWorkoutStore((state) => state.clearAll);
  const setModaleTitle = useWorkoutStore((state) => state.setModaleTitle);


  useEffect(() => {
    setModaleTitle(`Configurer l'exercice "${exerciseSelected?.name}"`);
  }, [exerciseSelected?.name, setModaleTitle]);

  const handleSubmit = (data: WorkoutExerciseFormData) => {

    addExercise({ ...exerciseSelected, ...data });
    clearAll();
    setStepAction(1);
    toast.success("Exercice ajouté !");
    closeModal("workoutSelectExercise");
  };

  return (
    <WorkoutExerciseForm
      exercise={null}
      onSubmit={handleSubmit}
      onClose={() => {
        setStepAction(1);
        clearAll();
      }}
      onCloseLabel="Retour"
      onSubmitLabel="Ajouter"
    />
  );
}