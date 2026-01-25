"use client";
import { createPortal } from "react-dom";
import { useModals } from "@/Providers/Modals";
import { ModalLayout } from "@/Global/components";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { toast } from "react-toastify";
import { WorkoutExerciseForm } from "../forms";
import { WorkoutExercise } from "@/types/workoutExercise";

export default function WorkoutEditExerciseModal({ index }: { index: number }) {
  const { closeModal } = useModals();
  const exercises = useWorkoutStore((state) => state.exercises);
  const updateExercise = useWorkoutStore((state) => state.updateExercise);
  const clearAll = useWorkoutStore((state) => state.clearAll);
  const exercise = exercises[index];


  // ✅ Return conditionnel APRÈS les hooks
  if (!exercise) {
    return null;
  }

  const handleSubmit = (data: Partial<WorkoutExercise>) => {
    updateExercise(index, { ...exercise, ...data });
    toast.success("Exercice modifié");
    closeModal("workoutEditExercise");
  };

  return createPortal(
    <ModalLayout
      title={`Modifier l'exercice "${exercise.name}"`}
      modalToClose="workoutEditExercise"
      option={() => {
        clearAll();
      }}
    >
      <WorkoutExerciseForm
        exercise={exercise}
        onSubmit={handleSubmit}
        onClose={() => closeModal("workoutEditExercise")}
        onCloseLabel="Annuler"
        onSubmitLabel="Enregistrer"
      />
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLElement
  );
}