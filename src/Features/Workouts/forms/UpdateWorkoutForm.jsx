"use client";

// Formulaire client pour modifier un plan d'entraînement existant.
import { DeleteConfirmModal, LoaderButton, Button } from "@/Global/components";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUpdateWorkout, useWorkoutForm } from "../hooks";
import { useModals } from "@/Providers/Modals";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";
import { toast } from "react-toastify";
import { workoutExercisesSchema, workoutSchema } from "../utils/workoutSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function UpdateWorkoutForm({
  workout,
  allExercises,
  favoritesExercises,
  isAdmin,
  userId,
}) {
  // Gestion du formulaire d'exercices via hook dédié
  const {
    errorExercises,
    setErrorExercises,
    isMounted,
    selectExercise,
    updateExercise,
    removeExercise,
    moveExercise,
    formData,
  } = useWorkoutForm({ workout });
  // Modales (sélection / édition / suppression d'exercice)
  const { isOpen, openModal, getModalData } = useModals();

  // Navigation et mutations
  const router = useRouter();
  const exercisesAdded = formData.exercises;
  const { mutate: updateWorkout, isPending: isUpdating } =
    useUpdateWorkout(userId);
  const title = "Supprimer l'exercice";
  const message = "Souhaitez vous retirer cet exercice du plan d'entraînement?";

  // React Hook Form avec valeurs pré-remplies du workout existant
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workoutSchema),
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
  const nameRegister = register("name");
  const nameRef = useRef(null);

  // Focus automatique sur le champ name
  useEffect(() => {
    nameRef?.current?.focus();
  }, []);

  // Réinitialisation de l'erreur d'exercices si l'utilisateur ajoute un exercice
  useEffect(() => {
    if (formData.exercises.length > 0) {
      setErrorExercises("");
    }
  }, [formData.exercises]);

  // Soumission du formulaire (validation + appel API)
  const onSubmit = async (data) => {
    setErrorExercises("");
    const result = workoutExercisesSchema.safeParse({
      exercises: formData.exercises,
    });
    if (!result.success) {
      setErrorExercises(result.error.issues[0].message);
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
          toast.error(err?.message || "Une erreur est survenue");
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
          errorExercises={errorExercises}
          nameRegister={nameRegister}
          nameRef={nameRef}
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

        {/* Message d'erreur exercices */}
        {errorExercises && <div className="formError">{errorExercises}</div>}

        {/* Boutons d'action */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">
            <span className="text-accent-500">*</span> Champs obligatoires
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              close
              onClick={() => router.back()}
              loadingText="Annulation en cours"
              label="Annuler"
            >
              Annuler
            </Button>

            <LoaderButton
              isLoading={isUpdating}
              loadingText="Modification en cours"
              type="submit"
              label="Enregistrer les modifications"
            >
              Enregistrer les modifications
            </LoaderButton>
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
          favoritesExercises={favoritesExercises}
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
