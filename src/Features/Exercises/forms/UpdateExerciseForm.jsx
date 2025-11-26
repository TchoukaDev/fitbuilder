"use client";

// Formulaire de modification d'un exercice existant
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useModals } from "@/Providers/Modals";
import { useUpdateExercise } from "../hooks";
import ExerciseFormFields from "./ExerciseFormFields";

export default function UpdateExerciseForm({ exerciseToUpdate }) {
  const { closeModal } = useModals();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // États du formulaire initialisés avec les valeurs existantes
  const [name, setName] = useState(exerciseToUpdate.name);
  const [muscle, setMuscle] = useState(exerciseToUpdate.muscle);
  const [description, setDescription] = useState(exerciseToUpdate.description);
  const [equipment, setEquipment] = useState(exerciseToUpdate.equipment);
  const [error, setError] = useState("");

  const { mutate: updateExercise, isPending } = useUpdateExercise(
    userId,
    isAdmin,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation des champs obligatoires
    if (!name.trim() || !muscle.trim() || !equipment) {
      setError("Veuillez compléter tous les champs obligatoires");
      return;
    }

    // Mutation de mise à jour
    updateExercise(
      {
        id: exerciseToUpdate._id,
        updatedExercise: {
          name,
          muscle,
          description,
          equipment,
          type: exerciseToUpdate.type,
        },
      },
      {
        onSuccess: () => {
          setName("");
          setMuscle("");
          setDescription("");
          setEquipment("");
          closeModal("updateExercise");
        },
        onError: (err) => {
          setError(
            err.message || "Une erreur est survenue lors de la modification",
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
      isPending={isPending}
      onNameChange={(e) => setName(e.target.value)}
      onMuscleChange={(e) => setMuscle(e.target.value)}
      onDescriptionChange={(e) => setDescription(e.target.value)}
      onEquipmentChange={(e) => setEquipment(e.target.value)}
      onSubmit={handleSubmit}
      onClose={() => closeModal("updateExercise")}
      submitLabel="Valider"
      loadingLabel="Mise à jour..."
    />
  );
}
