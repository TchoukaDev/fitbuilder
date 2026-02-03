"use client";

// Formulaire client pour modifier un plan d'entraînement existant.
import { DeleteConfirmModal } from "@/Global/components";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUpdateWorkout } from "../hooks";
import { useModals } from "@/Providers/Modals";
import { WorkoutFormFields, WorkoutFormExercisesList } from "./formsComponents";
import { toast } from "react-toastify";
import { WorkoutSchemaType, workoutSchema } from "../utils/workoutSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkoutFormActions } from "./formsComponents";
import {
  WorkoutEditExerciseModal,
  WorkoutSelectExerciseModal,
} from "../modals";
import { useWorkoutForm } from "../hooks/useWorkoutForm";
import ConfirmRouterBackModal from "../modals/ConfirmRouterBackModal";
import { Exercise } from "@/types/exercise";
import { Workout } from "@/types/workout";

interface updatedWorkoutFormProps {
  workout: Workout,
  allExercises: Exercise[],
  favoritesExercises: string[],
  isAdmin: boolean,
  userId: string
}

export default function UpdateWorkoutForm({
  workout,
  allExercises,
  favoritesExercises,
  isAdmin,
  userId,
}: updatedWorkoutFormProps) {
  const {
    exercises,
    errorExercises,
    clearAll,
    setErrorExercises,
    setExercises,
    handleDeleteExercise,
    handleRouterBack,
  } = useWorkoutForm({ initialExercises: workout.exercises, loadFromStorage: false });

  // Modales (sélection / édition / suppression d'exercice)
  const { isOpen, openModal, getModalData, closeModal } = useModals();

  // Navigation et mutations
  const router = useRouter();
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
  } = useForm<WorkoutSchemaType>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: workout.name || "",
      description: workout.description || "",
      category: workout.category || "",
      estimatedDuration: workout.estimatedDuration || 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();
  const nameRegister = register("name");

  // Soumission du formulaire (validation + appel API)
  const onSubmit = async (data: WorkoutSchemaType) => {
    setErrorExercises("");
    if (exercises.length === 0) {
      setErrorExercises("Veuillez ajouter au moins un exercice");
      return;
    }
    updateWorkout(
      {
        id: workout.id,
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
        {/* 📝 Champs du formulaire */}
        <WorkoutFormFields
          register={register}
          errors={errors}
          watchedFields={watchedFields}
          nameRegister={nameRegister}
        />

        {/* 📝 Liste des exercices */}
        <WorkoutFormExercisesList
          onAddClick={() => openModal("workoutSelectExercise")}
          onEditClick={(index) => openModal("workoutEditExercise", { index })}
          onRemoveClick={(index) => openModal("deleteConfirm", { index })}
        />

        {/* 🔘 Boutons d'action */}
        <WorkoutFormActions
          errorExercises={errorExercises}
          isLoading={isUpdating}
          loadingText="Mise à jour..."
          submitLabel="Enregistrer"
        />
      </form>

      {/* Modale de séletion d'exercise */}
      {isOpen("workoutSelectExercise") && (
        <WorkoutSelectExerciseModal
          userId={userId}
          isAdmin={isAdmin}
          allExercises={allExercises}
          favoritesExercises={favoritesExercises}
        />
      )}

      {/* ✅ Modale d'édition d'exercice */}
      {isOpen("workoutEditExercise") && (
        <WorkoutEditExerciseModal
          index={getModalData<{ index: number }>("workoutEditExercise")?.index ?? 0}
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

      {/* Modale de confirmation de retour */}
      {isOpen("confirmRouterBack") && (
        <ConfirmRouterBackModal onRouterBack={handleRouterBack} />
      )}
    </>
  );
}
