"use client";

import { useState } from "react";
import Label from "@/Global/components/ui/FormsComponents/Label/Label";
import Button from "@/Global/components/ui/Button";
import { toast } from "react-toastify";
import { useCreateExercise } from "../hooks";
import { useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import { useModals } from "@/Providers/ModalContext";

export default function NewExerciseForm() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // State (seulement pour les champs du formulaire)
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState("");

  const { closeModal } = useModals();
  const {
    mutate: createExercice,
    isPending,
    error,
  } = useCreateExercise(userId, isAdmin);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !muscle.trim() || !equipment) {
      toast.error("Veuillez compléter tous les champs obligatoires");
      return;
    }

    // ✅ Utiliser mutate avec callbacks
    createExercice(
      { name, muscle, description, equipment },
      {
        // ✅ Callback de succès
        onSuccess: (data) => {
          toast.success("Exercice créé avec succès !");

          // Réinitialiser le formulaire
          setName("");
          setMuscle("");
          setDescription("");
          setEquipment("");
          closeModal("newExercise");
        },
        // ✅ Callback d'erreur
        onError: () =>
          setError(
            error.message || "Une erreur est survenue lors de la modification",
          ),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur global */}
      {error && <div className="formError">{error.message}</div>}

      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending} // ✅ Désactive pendant le chargement
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
          disabled={isPending}
        />
        <Label htmlFor="muscle" value={muscle}>
          Muscle*
        </Label>
      </div>

      <select
        className="input py-5 peer"
        id="equipment"
        name="equipment"
        value={equipment}
        onChange={(e) => setEquipment(e.target.value)}
        aria-label="Matériel nécessaire"
        disabled={isPending}
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
          disabled={isPending}
        />
        <Label htmlFor="description" value={description}>
          Description
        </Label>
      </div>

      <div className="space-y-2">
        <div className="flex gap-4">
          <Button
            close
            onClick={() => closeModal("newExercise")}
            type="button"
            disabled={isPending} // ✅ Empêche de fermer pendant l'envoi
          >
            Fermer
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <span className="flex items-center gap-2">
                <span>Validation en cours...</span>
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
