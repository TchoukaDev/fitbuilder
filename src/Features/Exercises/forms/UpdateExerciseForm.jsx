"use client";

import { useState } from "react";
import Label from "@/Global/components/ui/FormsComponents/Label/Label";
import Button from "@/Global/components/ui/Button";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import { useModals } from "@/Providers/Modals/ModalContext";
import { useUpdateExercise } from "../hooks";

export default function UpdateExerciseForm({ exerciseToUpdate }) {
  const { closeModal } = useModals();
  // Session
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;
  // State
  const [name, setName] = useState(exerciseToUpdate.name);
  const [muscle, setMuscle] = useState(exerciseToUpdate.muscle);
  const [description, setDescription] = useState(exerciseToUpdate.description);
  const [equipment, setEquipment] = useState(exerciseToUpdate.equipment);
  const [error, setError] = useState("");

  // Hook
  const { mutate: updateExercise, isPending: isUpdating } = useUpdateExercise(
    userId,
    isAdmin,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    // 1. Validation
    if (!name.trim() || !muscle.trim() || !equipment) {
      setError("Veuillez compléter tous les champs obligatoires");
      return;
    }
    //  Mutation
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
        onSuccess: (data) => {
          toast.success(data.message || "Exercié modifié avec succès");
          // Réinitialiser le formulaire
          setName("");
          setMuscle("");
          setDescription("");
          setEquipment("");
          closeModal("updateExercise");
        },
      },
      {
        onError: (err) =>
          setError(
            err.message || "Une erreur est survenue lors de la modification",
          ),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Label htmlFor="name" value={name}>
          Intitulé*
        </Label>
      </div>

      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="muscle"
          name="muscle"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
        />
        <Label htmlFor="muscle" value={muscle}>
          Muscle*
        </Label>
      </div>

      <label htmlFor="equipment">Matériel :</label>
      <select
        className="input peer py-4"
        id="equipment"
        name="equipment"
        value={equipment}
        onChange={(e) => setEquipment(e.target.value)}
      >
        <option value="" className="font-semibold">
          -- Matériel nécessaire* --
        </option>
        <option value="Poids du corps">Poids du corps</option>
        <option value="Haltères">Haltères</option>
        <option value="Barre">Barre</option>
        <option value="Machine">Machine</option>
        <option value="Élastique">Élastique</option>
      </select>

      <div className="relative">
        <textarea
          className="input peer"
          placeholder=""
          id="description"
          name="description"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Label htmlFor="description" value={description}>
          Description
        </Label>
      </div>
      <div className="space-y-2">
        <div className="flex gap-4">
          <Button
            close
            onClick={() => closeModal("updateExercise")}
            type="button"
          >
            Fermer
          </Button>
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <span>Mise à jour...</span>
                <ClipLoader size={15} color="#e8e3ff" />
              </span>
            ) : (
              "Valider"
            )}
          </Button>
        </div>
        <div className="text-xs text-end">(*) champs obligatoires</div>
      </div>
    </form>
  );
}
