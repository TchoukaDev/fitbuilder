"use client";

// Formulaire de modification d'un exercice existant
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useModals } from "@/Providers/Modals";
import { useUpdateExercise } from "../hooks";
import ExerciseFormFields from "./ExerciseFormFields";
import { ExerciseFormData, exerciseSchema } from "../utils/ExerciseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Exercise } from "@/types/exercise";


export default function UpdateExerciseForm({ exerciseToUpdate }: { exerciseToUpdate: Exercise }) {
  const { closeModal } = useModals();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id || "";

  // React Hook Form avec validation Zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exerciseToUpdate.name,
      description: exerciseToUpdate.description || "",
      equipment: exerciseToUpdate.equipment || "",
      muscle: exerciseToUpdate.muscle || "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const nameRegister = register("name");
  const nameRef = useRef<HTMLInputElement>(null);
  const watchedFields = watch();
  useEffect(() => {
    nameRef?.current?.focus();
  }, []);

  const { mutate: updateExercise, isPending: isUpdating } = useUpdateExercise(
    { userId, isAdmin },
  );

  const onSubmit = async (data: ExerciseFormData) => {
    updateExercise(
      {
        exerciseId: exerciseToUpdate.exerciseId,
        updatedExercise: data,
      },
      {
        onSuccess: () => {
          closeModal("updateExercise");
        },
        onError: (err) => {
          toast.error(
            err.message || "Une erreur est survenue lors de la modification",
          );
        },
      },
    );
  };

  return (
    <ExerciseFormFields
      register={register}
      errors={errors}
      isPending={isUpdating}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      watchedFields={watchedFields}
      onClose={() => closeModal("updateExercise")}
      submitLabel="Valider"
      loadingLabel="Mise à jour..."
      nameRegister={nameRegister}
      nameRef={nameRef}
    />
  );
}
