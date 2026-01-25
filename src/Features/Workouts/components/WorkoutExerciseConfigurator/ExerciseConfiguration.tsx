"use client";
import { useEffect, useState } from "react";
import { Button, Label } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";
import { useModals } from "@/Providers/Modals";
import { toast } from "react-toastify";
import { useWorkoutStore } from "@/Features/Workouts/store";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { Exercise } from "@/types/exercise";


export default function ExerciseConfiguration({ exerciseSelected }: { exerciseSelected: Exercise }) {
  const { closeModal } = useModals();
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const setStepAction = useWorkoutStore((state) => state.setStep);
  const clearAll = useWorkoutStore((state) => state.clearAll);
  const setModaleTitle = useWorkoutStore((state) => state.setModaleTitle);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sets: "",
    reps: "",
    targetWeight: "",
    restTime: "",
    notes: "",
  });

  useEffect(() => {
    setModaleTitle(`Configurer l'exercice "${exerciseSelected?.name}"`);
  }, [exerciseSelected?.name, setModaleTitle]);

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

    const finalWeight = isNaN(targetWeight) ? 0 : targetWeight;

    if (isNaN(restTime) || restTime <= 0) {
      setError("Le temps de repos est invalide");
      return;
    }

    const exerciseToAdd = {
      ...exerciseSelected,
      sets,
      reps,
      targetWeight: finalWeight,
      restTime,
      notes: formData.notes.trim(),
    };

    addExercise(exerciseToAdd);
    clearAll();
    setStepAction(1);
    toast.success("Exercice ajouté !");
    closeModal("workoutSelectExercise");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
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

      {/* Poids */}
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
          Poids prévu (kg) <span className="text-accent-500">*</span>
        </Label>
      </div>

      {/* Repos */}
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
          rows={3}
          className="input peer"
          placeholder=""
          id="notes"
          name="notes"
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
          onClick={() => {
            setStepAction(1);
            clearAll();
          }}
        >
          Retour
        </Button>
        <Button type="submit">
          Ajouter
        </Button>
      </div>

      <RequiredFields />
    </form>
  );
}