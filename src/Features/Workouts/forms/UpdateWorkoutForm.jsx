"use client";

// Formulaire client pour modifier un plan d'entraînement existant.
import { Button, DeleteConfirmModal } from "@/Global/components";
import { ClipLoader } from "react-spinners";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUpdateWorkout, useWorkoutForm } from "../hooks";
import { useModals } from "@/Providers/Modals";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";

export default function UpdateWorkoutForm({
  workout,
  allExercises,
  favorites,
  isAdmin,
  userId,
}) {
  // Gestion du formulaire d'exercices via hook dédié
  const {
    error,
    setError,
    isMounted,
    selectExercise,
    updateExercise,
    removeExercise,
    moveExercise,
    formData,
  } = useWorkoutForm({ workout });
  // Modales (sélection / édition / suppression d'exercice)
  const { isOpen, openModal, getModalData } = useModals();
  console.log(getModalData("workoutEditExercise")?.index);

  // Navigation et mutations
  const router = useRouter();
  const exercisesAdded = formData.exercises;
  const { mutate: updateWorkout, isPending } = useUpdateWorkout(userId);
  const title = "Supprimer l'exercice";
  const message = "Souhaitez vous retirer cet exercice du plan d'entraînement?";

  // React Hook Form avec valeurs pré-remplies du workout existant
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: workout.name || "",
      description: workout.description || "",
      category: workout.category || "",
      estimatedDuration: workout.estimatedDuration || "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();

  // Soumission du formulaire (validation + appel API)
  const onSubmit = async (data) => {
    setError("");
    if (formData.exercises.length === 0) {
      setError("Veuillez ajouter au moins un exercice");
      return;
    }

    updateWorkout(
      {
        id: workout._id,
        updatedWorkout: { ...data, exercises: formData.exercises },
      },
      {
        onSuccess: (result) => {
          router.back();
          router.refresh();
        },
        onError: (err) => {
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
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>

            <Button disabled={isPending} type="submit">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <ClipLoader size={15} color="#e8e3ff" />
                  Modification en cours...
                </span>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Modale de séletion d'exercise */}
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

      {/* ✅ Modale d'édition d'exercice */}
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
