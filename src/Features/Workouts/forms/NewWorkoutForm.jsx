"use client";

// Formulaire client pour créer un nouveau plan d'entraînement.
import { DeleteConfirmModal, LoaderButton } from "@/Global/components";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCreateWorkout, useWorkoutForm } from "../hooks";
import { useModals } from "@/Providers/Modals";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutSchema } from "../utils/workoutSchema";

export default function NewWorkoutForm({
  allExercises,
  favoritesExercises,
  isAdmin,
  userId,
}) {
  // Gestion du formulaire d'exercices avec persistance locale (newForm)
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
    isClearingStorage,
  } = useWorkoutForm({ newForm: true });

  // Navigation et variables UI
  const router = useRouter();
  const exercisesAdded = formData.exercises;
  const title = "Supprimer l'exercice";
  const message = "Souhaitez vous retirer cet exercice du plan d'entraînement?";

  const { mutate: createWorkout, isPending: isCreating } =
    useCreateWorkout(userId);

  // Modales (sélection / édition / suppression d'exercice)
  const { isOpen, openModal, getModalData } = useModals();

  // Configuration de React Hook Form
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
    resolver: zodResolver(workoutSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();

  // Soumission du formulaire (validation + création côté API)
  const onSubmit = async (data) => {
    setError("");
    if (formData.exercises.length === 0) {
      setError("Veuillez ajouter au moins un exercice");
      return;
    }
    createWorkout(
      { ...data, exercises: formData.exercises },
      {
        onSuccess: () => {
          clearStorage();
          router.refresh();
          router.push("/workouts");
        },
        onError: (err) => {
          setError(err?.message || "Une erreur est survenue");
        },
      },
    );
  };

  // RENDER
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <WorkoutFormFields
          register={register}
          errors={errors}
          watchedFields={watchedFields}
        />

        {/* Liste d'exercices */}
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
        {error && <div className="formError">{error}</div>}

        {/* Boutons d'action */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">
            <span className="text-accent-500">*</span> Champs obligatoires
          </p>

          <div className="flex gap-3">
            <LoaderButton
              type="button"
              close
              onClick={() => {
                clearStorage();
                router.back();
              }}
              disabled={isClearingStorage}
              loadingText="Annulation en cours"
              label="Annuler"
            >
              Annuler
            </LoaderButton>

            <LoaderButton
              isLoading={isCreating}
              loadingText="Création en cours"
              type="submit"
              label="Créer le plan d'entraînement"
            >
              Créer le plan d'entraînement
            </LoaderButton>
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
          favoritesExercises={favoritesExercises}
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
