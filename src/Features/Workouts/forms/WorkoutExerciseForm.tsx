"use client";

import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { useState } from "react";
import { WorkoutExercise } from "@/types/workoutExercise";
import { handleKeyDown } from "@/Global/utils";
import { Label } from "@/Global/components/ui/FormsComponents";
import { Button } from "@/Global/components";
import { WorkoutExerciseFormData } from "../components/WorkoutExerciseConfigurator/ExerciseConfiguration";


interface WorkoutExerciseFormProps {
  exercise: WorkoutExercise | null;
  onSubmit: (data: WorkoutExerciseFormData) => void;
  onClose: () => void;
  onCloseLabel: string;
  onSubmitLabel: string;
}
export default function WorkoutExerciseForm({ exercise, onSubmit, onClose, onCloseLabel, onSubmitLabel }: WorkoutExerciseFormProps) {

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sets: exercise?.sets?.toString() ?? "",
    reps: exercise?.reps?.toString() ?? "",
    targetWeight: exercise?.targetWeight?.toString() ?? "",
    restTime: exercise?.restTime?.toString() ?? "",
    notes: exercise?.notes ?? "",
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const sets = parseInt(formData.sets);
    const reps = parseInt(formData.reps);
    const targetWeight = parseFloat(formData.targetWeight);
    const restTime = parseInt(formData.restTime);
    const notes = formData.notes.trim();

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
    const finalWeight = isNaN(targetWeight) ? 0 : targetWeight;

    onSubmit({
      sets,
      reps,
      targetWeight: finalWeight,
      restTime,
      notes,
    });
  }

  return (
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
          onClick={onClose}
        >
          {onCloseLabel}
        </Button>
        <Button type="submit">{onSubmitLabel}</Button>
      </div>

      <RequiredFields />
    </form>
  )
}