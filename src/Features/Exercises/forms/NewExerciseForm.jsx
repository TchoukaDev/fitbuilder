"use client";

// Formulaire de création d'un nouvel exercice
import { useState } from "react";
import { useCreateExercise } from "../hooks";
import { useSession } from "next-auth/react";
import { useModals } from "@/Providers/Modals";
import ExerciseFormFields from "./ExerciseFormFields";
import { exerciseSchema } from "../utils/ExerciseSchema";

export default function NewExerciseForm() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // États du formulaire
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState("");
  const [error, setError] = useState("");

  const { closeModal } = useModals();
  const { mutate: createExercice, isPending: isCreating } = useCreateExercise(
    userId,
    isAdmin,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation des champs obligatoires
    const result = exerciseSchema.safeParse({
      name,
      muscle,
      description,
      equipment,
    });
    if (!result.success) {
      setError("Veuillez compléter tous les champs obligatoires");
      return;
    }

    // Mutation de création
    createExercice(
      { name, muscle, description, equipment },
      {
        onSuccess: () => {
          setName("");
          setMuscle("");
          setDescription("");
          setEquipment("");
          closeModal("newExercise");
        },
        onError: (err) => {
          setError(
            err?.message || "Une erreur est survenue lors de la création",
          );
        },
      },
    );
  };

  return (
    <ExerciseFormFields
      name={name}
      muscle={muscle}
      description={description}
      equipment={equipment}
      error={error}
      isPending={isCreating}
      onNameChange={(e) => setName(e.target.value)}
      onMuscleChange={(e) => setMuscle(e.target.value)}
      onDescriptionChange={(e) => setDescription(e.target.value)}
      onEquipmentChange={(e) => setEquipment(e.target.value)}
      onSubmit={handleSubmit}
      onClose={() => closeModal("newExercise")}
      submitLabel="Valider"
      loadingLabel="Validation en cours..."
    />
  );
}
