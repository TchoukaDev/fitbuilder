"use client";
import { useState } from "react";
import { Button, Label } from "@/Global/components";
import { createPortal } from "react-dom";
import { useModals } from "@/Providers/Modals";
import { ModalLayout } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { toast } from "react-toastify";

// Modale de modifier d'un exercice ajouté dans l'entraînement
export default function WorkoutEditExerciseModal({ index }) {
  const { closeModal } = useModals();
  const exercises = useWorkoutStore((state) => state.exercises);
  const updateExercise = useWorkoutStore((state) => state.updateExercise);

  // Récupérer l'exercice depuis le store pour éviter les race conditions
  const exercise = exercises[index];

  // Défaut sûr si l'exercice n'existe pas
  if (!exercise) {
    return null;
  }

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    sets: exercise.sets || 3,
    reps: exercise.reps || "10",
    targetWeight: exercise.targetWeight || 0,
    restTime: exercise.restTime || 90,
    notes: exercise.notes || "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Validation
    if (
      formData.sets === "" ||
      formData.reps === "" ||
      formData.restTime === ""
    ) {
      setError("Veuillez compléter tous les champs obligatoires");
      return;
    }

    // Sauvegarder avec toutes les données de l'exercice
    updateExercise(index, {
      ...exercise, // Garde l'ID, le nom, l'ordre, etc.
      ...formData, // Écrase avec les nouvelles valeurs
    });
    closeModal("workoutEditExercise");
    toast.success("Exercice modifié");
  };

  return createPortal(
    <ModalLayout
      title={`Modifier l'exercice "${exercise.name}"`}
      modalToClose="workoutEditExercise"
    >
      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="p-6 flex flex-col items-center gap-5"
      >
        {/* Séries */}
        <div className="relative">
          <input
            type="number"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="sets"
            name="sets"
            required
            value={formData.sets}
            onChange={(e) =>
              setFormData({
                ...formData,
                sets: parseInt(e.target.value) || 0,
              })
            }
          />
          <Label htmlFor="sets" value={formData.sets}>
            Nombre de séries <span className="text-accent-500">*</span>
          </Label>
        </div>

        {/* Répétitions */}
        <div className="relative">
          <input
            className="input peer"
            placeholder=""
            id="reps"
            name="reps"
            required
            value={formData.reps}
            onChange={(e) =>
              setFormData({ ...formData, reps: e.target.value || 0 })
            }
          />
          <Label htmlFor="reps" value={formData.reps}>
            Répétitions <span className="text-accent-500">*</span> (ex: "10" ou
            "8-12")
          </Label>
        </div>

        {/* Poids prévu */}
        <div className="relative">
          <input
            type="number"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="targetWeight"
            name="targetWeight"
            value={formData.targetWeight}
            onChange={(e) =>
              setFormData({
                ...formData,
                targetWeight: parseFloat(e.target.value) || 0,
              })
            }
          />
          <Label htmlFor="targetWeight" value={formData.targetWeight}>
            Poids prévu (kg)
          </Label>
        </div>

        {/* Temps de repos */}
        <div className="relative">
          <input
            type="number"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="restTime"
            name="restTime"
            value={formData.restTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                restTime: parseInt(e.target.value) || 0,
              })
            }
          />
          <Label htmlFor="restTime" value={formData.restTime}>
            Temps de repos (secondes)
          </Label>
        </div>

        {/* Notes */}
        <div className="relative">
          <textarea
            className="input peer"
            placeholder=""
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
          <Label htmlFor="notes" value={formData.notes}>
            Notes (optionnel)
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Ex: "Tempo lent", "Prise large", etc.
          </p>
        </div>

        {/* Erreur formulaire  */}
        {error && <p className="formError my-3">{error}</p>}

        {/* Boutons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            close
            onClick={() => closeModal("workoutEditExercise")}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button type="submit" className="flex-1">
            Enregistrer
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          <span className="text-accent-500">*</span> Champs obligatoires
        </p>
      </form>
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
