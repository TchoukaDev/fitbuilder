"use client";

// Formulaire de création d'un nouvel exercice
import { useCreateExercise } from "../hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useModals } from "@/Providers/Modals";
import ExerciseFormFields from "./ExerciseFormFields";
import { exerciseSchema } from "../utils/ExerciseSchema";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function NewExerciseForm() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // React Hook Form avec validation Zod
  const {
    register,
    isSubmitting,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(exerciseSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();
  const nameRegister = register("name");
  const nameRef = useRef(null);

  const { closeModal } = useModals();
  const { mutate: createExercice, isPending: isCreating } = useCreateExercise(
    userId,
    isAdmin,
  );
  useEffect(() => {
    nameRef?.current?.focus();
  }, []);

  const onSubmit = async (data) => {
    // Mutation de création
    createExercice(data, {
      onSuccess: () => {
        closeModal("newExercise");
      },
      onError: (err) => {
        toast.error(
          err?.message || "Une erreur est survenue lors de la création",
        );
      },
    });
  };

  return (
    <ExerciseFormFields
      register={register}
      errors={errors}
      isPending={isCreating}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => closeModal("newExercise")}
      submitLabel="Valider"
      loadingLabel="Validation en cours..."
      watchedFields={watchedFields}
      nameRegister={nameRegister}
      nameRef={nameRef}
    />
  );
}
