"use client";

import { Button, DeleteConfirmModal, LoaderButton } from "@/Global/components";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCreateWorkout } from "../hooks";
import { useModals } from "@/Providers/Modals";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";
import { workoutExercisesSchema, workoutSchema } from "../utils/workoutSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useWorkoutForm } from "../hooks/useWorkoutForm";

export default function NewWorkoutForm({
  allExercises,
  favoritesExercises,
  isAdmin,
  userId,
}) {
  const {
    exercises,
    errorExercises,
    clearAll,
    setExercises,
    setErrorExercises,
    clearStorage,
    handleDeleteExercise,
  } = useWorkoutForm({ loadFromStorage: true });
  const router = useRouter();
  const { isOpen, openModal, getModalData } = useModals();
  const { mutate: createWorkout, isPending: isCreating } =
    useCreateWorkout(userId);

  // ========================================
  // 📝 REACT HOOK FORM (champs du workout)
  // ========================================
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      estimatedDuration: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();
  const nameRegister = register("name");

  // ========================================
  // ⚡ EFFETS
  // ========================================

  // ========================================
  // 📤 SOUMISSION DU FORMULAIRE
  // ========================================
  const onSubmit = async (data) => {
    // Réinitialiser l'erreur
    setErrorExercises("");

    // Valider les exercices
    const result = workoutExercisesSchema.safeParse({ exercises });

    if (!result.success) {
      // Afficher la première erreur
      setErrorExercises(result.error.issues[0].message);
      return;
    }

    // Créer le workout
    createWorkout(
      { ...data, exercises },
      {
        onSuccess: () => {
          clearAll();
          clearStorage();
          setExercises([]);
          router.refresh();
          router.push("/workouts");
        },
        onError: (err) => {
          toast.error(err?.message || "Une erreur est survenue");
        },
      },
    );
  };

  // ========================================
  // 🎨 RENDER
  // ========================================
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 📝 Champs du formulaire (nom, description, etc.) */}
        <WorkoutFormFields
          register={register}
          errors={errors}
          watchedFields={watchedFields}
          nameRegister={nameRegister}
        />

        {/* 📋 Liste des exercices */}
        <WorkoutFormExercisesList
          onAddClick={() => openModal("workoutSelectExercise")}
          onEditClick={(index) => openModal("workoutEditExercise", { index })}
          onRemoveClick={(index) => openModal("deleteConfirm", { index })}
        />

        {/* ⚠️ Message d'erreur pour les exercices */}
        {errorExercises && <div className="formError">{errorExercises}</div>}

        {/* 🔘 Boutons d'action */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">
            <span className="text-accent-500">*</span> Champs obligatoires
          </p>

          <div className="flex gap-3">
            {/* Bouton Annuler */}
            <Button
              type="button"
              close
              onClick={() => {
                clearAll();
                clearStorage();
                setExercises([]);
                router.refresh();
                router.back();
              }}
            >
              Annuler
            </Button>

            {/* Bouton Créer */}
            <LoaderButton
              isLoading={isCreating}
              loadingText="Création en cours..."
              type="submit"
            >
              Créer le plan d'entraînement
            </LoaderButton>
          </div>
        </div>
      </form>

      {/* ========================================
          🪟 MODALES
          ======================================== */}

      {/* Modale : Sélectionner un exercice */}
      {isOpen("workoutSelectExercise") && (
        <WorkoutSelectExerciseModal
          userId={userId}
          isAdmin={isAdmin}
          allExercises={allExercises}
          favoritesExercises={favoritesExercises}
        />
      )}

      {/* Modale : Éditer un exercice */}
      {isOpen("workoutEditExercise") && (
        <WorkoutEditExerciseModal
          index={getModalData("workoutEditExercise").index}
        />
      )}

      {/* Modale : Confirmer suppression */}
      {isOpen("deleteConfirm") && (
        <DeleteConfirmModal
          title="Supprimer l'exercice"
          message="Souhaitez-vous retirer cet exercice du plan d'entraînement ?"
          onConfirm={handleDeleteExercise}
        />
      )}
    </>
  );
}
