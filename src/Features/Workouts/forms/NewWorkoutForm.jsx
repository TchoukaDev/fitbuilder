"use client";
import { Button, DeleteConfirmModal } from "@/Global/components";
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCreateWorkout } from "../hooks";
import { useModals } from "@/Providers/Modals";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import WorkoutFormFields from "./WorkoutFormFields";
import WorkoutFormExercisesList from "./WorkoutFormExercisesList";
import { useWorkoutForm } from "../hooks/useWorkoutForm";

export default function NewWorkoutForm({
  allExercises,
  favorites,
  isAdmin,
  userId,
}) {
  const {
    error,
    setError,
    isMounted,
    selectExercise,
    updateExercise,
    removeExercise,
    moveExercise,
    clearStorage,
    formData,
  } = useWorkoutForm({ newForm: true });

  // Variables
  const router = useRouter();
  const exercisesAdded = formData.exercises;
  const title = "Supprimer l'exercice";
  const message = "Souhaitez vous retirer cet exercice du plan d'entraînement?";

  const { mutate: createWorkout, isPending } = useCreateWorkout(userId);

  // Modal
  const { isOpen, openModal, getModalData } = useModals();

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      estimatedDuration: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();

  // Gestion du formulaire
  const onSubmit = async (data) => {
    setError("");
    if (formData.exercises.length === 0) {
      setError("Veuillez ajouter au moins un exercice");
      return;
    }
    createWorkout(
      { ...data, exercises: formData.exercises },
      {
        onSuccess: (result) => {
          toast.success(result.message);
          clearStorage();
          router.refresh();
          router.push("/workouts");
        },
        onError: (err) => {
          console.log("erreur", err);
          setError(err.message || "Une erreur est survenue");
        },
      },
    );
  };

  // RENDER
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ✅ Composant réutilisable */}
        <WorkoutFormFields
          register={register}
          errors={errors}
          watchedFields={watchedFields}
        />

        {/* ✅ Composant réutilisable */}
        <WorkoutFormExercisesList
          exercises={formData.exercises}
          isMounted={isMounted}
          onAddClick={() => openModal("workoutSelectExercise")}
          onEditClick={(exercise, index) =>
            openModal("workoutEditExercise", { exercise, index })
          }
          onRemoveClick={(index) => openModal("deleteConfirm", { index })}
          onMoveClick={moveExercise}
        />

        {/* Message d'erreur global */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Champs obligatoires
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              close
              onClick={() => {
                clearStorage();
                router.back();
              }}
              disabled={isPending}
            >
              Annuler
            </Button>

            <Button disabled={isPending} type="submit">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <ClipLoader size={15} color="#e8e3ff" />
                  Création en cours...
                </span>
              ) : (
                "Créer le plan d'entraînement"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Modales */}
      {isOpen("workoutSelectExercise") && (
        <WorkoutSelectExerciseModal
          exercisesAdded={exercisesAdded}
          userId={userId}
          isAdmin={isAdmin}
          onSelectExercise={selectExercise}
          allExercises={allExercises}
          favorites={favorites}
        />
      )}

      {isOpen("workoutEditExercise") && (
        <WorkoutEditExerciseModal
          exercise={getModalData("workoutEditExercise").exercise}
          onSave={updateExercise}
        />
      )}

      {/* Modale de suppression d'exercice */}
      {isOpen("deleteConfirm") && (
        <DeleteConfirmModal
          title={title}
          message={message}
          onConfirm={() => removeExercise(getModalData("deleteConfirm").index)}
        />
      )}
    </>
  );
}
