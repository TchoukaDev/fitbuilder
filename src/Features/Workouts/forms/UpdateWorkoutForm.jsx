"use client";

// Formulaire client pour modifier un plan d'entraînement existant.
import { DeleteConfirmModal, LoaderButton, Button } from "@/Global/components";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUpdateWorkout } from "../hooks";
import { useModals } from "@/Providers/Modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";
import { toast } from "react-toastify";
import { workoutExercisesSchema, workoutSchema } from "../utils/workoutSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { useWorkoutForm } from "../hooks/useWorkoutForm";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";

export default function UpdateWorkoutForm({
  workout,
  allExercises,
  favoritesExercises,
  isAdmin,
  userId,
}) {
  const {
    exercises,
    errorExercises,
    clearAll,
    setErrorExercises,
    setExercises,
    handleDeleteExercise,
  } = useWorkoutForm({ initialExercises: workout.exercises });

  // Modales (sélection / édition / suppression d'exercice)
  const { isOpen, openModal, getModalData } = useModals();

  // Navigation et mutations
  const router = useRouter();
  const exercisesAdded = exercises;
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

  // Soumission du formulaire (validation + appel API)
  const onSubmit = async (data) => {
    setErrorExercises("");
    const result = workoutExercisesSchema.safeParse({
      exercises: exercises,
    });
    if (!result.success) {
      setErrorExercises(result.error.issues[0].message);
      return;
    }
    updateWorkout(
      {
        id: workout._id,
        updatedWorkout: { ...data, exercises: exercises },
      },
      {
        onSuccess: (result) => {
          clearAll();
          setExercises([]);
          router.refresh();
          router.back();
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
        />

        {/* ✅ Composant réutilisable */}
        <WorkoutFormExercisesList
          onAddClick={() => openModal("workoutSelectExercise")}
          onEditClick={(index) => openModal("workoutEditExercise", { index })}
          onRemoveClick={(index) => openModal("deleteConfirm", { index })}
        />

        {/* Message d'erreur exercices */}
        {errorExercises && <div className="formError">{errorExercises}</div>}

        {/* Boutons d'action */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <RequiredFields />

          <div className="flex gap-3">
            <Button
              type="button"
              close
              onClick={() => {
                clearAll();
                setExercises([]);
                router.refresh();
                router.back();
              }}
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
          allExercises={allExercises}
          favoritesExercises={favoritesExercises}
        />
      )}

      {/* ✅ Modale d'édition d'exercice */}
      {isOpen("workoutEditExercise") && (
        <WorkoutEditExerciseModal
          index={getModalData("workoutEditExercise").index}
        />
      )}

      {/* Modale de suppression d'exercice */}
      {isOpen("deleteConfirm") && (
        <DeleteConfirmModal
          title={title}
          message={message}
          onConfirm={handleDeleteExercise}
        />
      )}
    </>
  );
}
