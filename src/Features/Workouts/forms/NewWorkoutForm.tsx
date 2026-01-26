"use client";

import { DeleteConfirmModal } from "@/Global/components";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCreateWorkout } from "../hooks";
import { useModals } from "@/Providers/Modals";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";
import { workoutExercisesSchema, workoutSchema, WorkoutSchemaType } from "../utils/workoutSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useWorkoutForm } from "../hooks/useWorkoutForm";
import { WorkoutFormActions } from "./formsComponents";
import ConfirmRouterBackModal from "../modals/ConfirmRouterBackModal";
import { Exercise } from "@/types/exercise";


interface NewWorkoutFormProps {
  allExercises: Exercise[];
  favoritesExercises: string[];
  isAdmin: boolean;
  userId: string;
}

export default function NewWorkoutForm({
  allExercises,
  favoritesExercises,
  isAdmin,
  userId,
}: NewWorkoutFormProps) {
  const {
    exercises,
    errorExercises,
    clearAll,
    setExercises,
    setErrorExercises,
    clearStorage,
    handleDeleteExercise,
    handleRouterBack,
  } = useWorkoutForm({ initialExercises: [], loadFromStorage: true });
  const router = useRouter();
  const { isOpen, openModal, getModalData, closeModal } = useModals();
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
      estimatedDuration: 0,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();
  const nameRegister = register("name");

  // ========================================
  // 📤 SOUMISSION DU FORMULAIRE
  // ========================================
  const onSubmit = async (data: WorkoutSchemaType) => {
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

        {/* 🔘 Boutons d'action */}
        <WorkoutFormActions
          errorExercises={errorExercises}
          isLoading={isCreating}
          loadingText="Création..."
          submitLabel="Créer"

        />
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
          index={getModalData<{ index: number }>("workoutEditExercise")?.index ?? 0}
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


      {/* Modale de confirmation de suppression de tous les exercices */}
      {isOpen("clearExercises") && (
        <DeleteConfirmModal
          title="Vider la liste des exercices"
          message="Souhaitez-vous vider la liste des exercices ?"
          onConfirm={() => {
            setExercises([]);
            closeModal("clearExercises");
          }}
          modalToClose="clearExercises"
          confirmMessage="Vider"
        />
      )}

      {isOpen("confirmRouterBack") && (
        <ConfirmRouterBackModal onRouterBack={handleRouterBack} />
      )}

    </>
  );
}
