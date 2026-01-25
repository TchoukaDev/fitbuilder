"use client";
import { useState } from "react";
import { Button, Label } from "@/Global/components";
import { createPortal } from "react-dom";
import { useModals } from "@/Providers/Modals";
import { ModalLayout } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";
import { useWorkoutStore } from "@/Features/Workouts/store";
import { toast } from "react-toastify";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";

export default function WorkoutEditExerciseModal({ index }: { index: number }) {
  const { closeModal } = useModals();
  const exercises = useWorkoutStore((state) => state.exercises);
  const updateExercise = useWorkoutStore((state) => state.updateExercise);
  const clearAll = useWorkoutStore((state) => state.clearAll);
  const exercise = exercises[index];


  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sets: exercise?.sets?.toString() ?? "",
    reps: exercise?.reps?.toString() ?? "",
    targetWeight: exercise?.targetWeight?.toString() ?? "",
    restTime: exercise?.restTime?.toString() ?? "",
    notes: exercise?.notes ?? "",
  })

  // ✅ Return conditionnel APRÈS les hooks
  if (!exercise) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Conversion
    const sets = parseInt(formData.sets);
    const reps = parseInt(formData.reps);
    const targetWeight = parseFloat(formData.targetWeight);
    const restTime = parseInt(formData.restTime);

    // Validation
    if (isNaN(sets) || sets <= 0) {
      setError("Le nombre de séries est invalide");
      return;
    }
    if (isNaN(reps) || reps <= 0) {
      setError("Le nombre de répétitions est invalide");
      return;
    }
    if (isNaN(restTime) || restTime <= 0) {
      setError("Le temps de repos est invalide");
      return;
    }

    // targetWeight peut être 0 ou vide (optionnel)
    const finalWeight = isNaN(targetWeight) ? 0 : targetWeight;

    updateExercise(index, {
      ...exercise,
      sets,
      reps,
      targetWeight: finalWeight,
      restTime,
      notes: formData.notes.trim(),
    });

    closeModal("workoutEditExercise");
    toast.success("Exercice modifié");
  };

  return createPortal(
    <ModalLayout
      title={`Modifier l'exercice "${exercise.name}"`}
      modalToClose="workoutEditExercise"
      option={() => {
        clearAll();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="p-6 flex flex-col items-center gap-5"
      >
        {/* Séries */}
        <div className="relative">
          <input
            type="number"
            min="1"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="sets"
            name="sets"
            value={formData.sets}
            onChange={(e) =>
              setFormData({ ...formData, sets: e.target.value })
            }
          />
          <Label htmlFor="sets" value={formData.sets}>
            Nombre de séries <span className="text-accent-500">*</span>
          </Label>
        </div>

        {/* Répétitions */}
        <div className="relative">
          <input
            type="number"
            min="1"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="reps"
            name="reps"
            value={formData.reps}
            onChange={(e) =>
              setFormData({ ...formData, reps: e.target.value })
            }
          />
          <Label htmlFor="reps" value={formData.reps}>
            Répétitions <span className="text-accent-500">*</span>
          </Label>
        </div>

        {/* Poids prévu */}
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.5"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="targetWeight"
            name="targetWeight"
            value={formData.targetWeight}
            onChange={(e) =>
              setFormData({ ...formData, targetWeight: e.target.value })
            }
          />
          <Label htmlFor="targetWeight" value={formData.targetWeight}>
            Charge cible (kg)
          </Label>
        </div>

        {/* Temps de repos */}
        <div className="relative">
          <input
            type="number"
            min="1"
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            id="restTime"
            name="restTime"
            value={formData.restTime}
            onChange={(e) =>
              setFormData({ ...formData, restTime: e.target.value })
            }
          />
          <Label htmlFor="restTime" value={formData.restTime}>
            Temps de repos (secondes) <span className="text-accent-500">*</span>
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
        </div>

        {error && <p className="formError my-3">{error}</p>}

        <div className="modalFooter">
          <Button
            type="button"
            close
            onClick={() => closeModal("workoutEditExercise")}
          >
            Annuler
          </Button>
          <Button type="submit">Enregistrer</Button>
        </div>

        <RequiredFields />
      </form>
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLElement
  );
}