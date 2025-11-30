"use client";

// Formulaire de modification d'un exercice existant
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useModals } from "@/Providers/Modals";
import { useUpdateExercise } from "../hooks";
import ExerciseFormFields from "./ExerciseFormFields";
import { exerciseSchema } from "../utils/ExerciseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function UpdateExerciseForm({ exerciseToUpdate }) {
  const { closeModal } = useModals();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // React Hook Form avec validation Zod
  const {
    register,
    handleSubmit,
    isSubmitting,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(exerciseSchema),
  });

  const nameRegister = register("name");
  const nameRef = useRef(null);
  const watchedFields = watch();
  useEffect(() => {
    nameRef?.current?.focus();
  }, []);

  const { mutate: updateExercise, isPending: isUpdating } = useUpdateExercise(
    userId,
    isAdmin,
  );

  const onSubmit = async (data) => {
    updateExercise(
      {
        id: exerciseToUpdate._id,
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
