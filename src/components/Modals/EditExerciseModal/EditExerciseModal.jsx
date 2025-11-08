"use client";
import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/Buttons/Button";
import Label from "@/components/Forms/FormsComponents/Label/Label";
import { toast } from "react-toastify";

export default function EditExerciseModal({ exercise, onSave, onClose }) {
  const [formData, setFormData] = useState({
    sets: exercise.sets || 3,
    reps: exercise.reps || "10",
    targetWeight: exercise.targetWeight || "",
    restTime: exercise.restTime || 90,
    notes: exercise.notes || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.sets || !formData.reps) {
      toast.error("Séries et répétitions sont obligatoires");
      return;
    }

    // Sauvegarder avec toutes les données de l'exercice
    onSave({
      ...exercise, // Garde l'ID, le nom, l'ordre, etc.
      ...formData, // Écrase avec les nouvelles valeurs
    });
  };

  return (
    <div
      onClick={() => {
        onClose();
      }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="m-auto">
            <h2 className="text-2xl font-bold text-primary-900">
              Modifier l'exercice "{exercise.name}"
            </h2>
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col items-center gap-5"
        >
          {/* Séries */}
          <div className="relative">
            <input
              type="number"
              className="input peer"
              placeholder=""
              id="sets"
              name="sets"
              required
              value={formData.sets}
              onChange={(e) =>
                setFormData({ ...formData, sets: parseInt(e.target.value) })
              }
            />
            <Label htmlFor="sets" value={formData.sets}>
              Nombre de séries*
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
                setFormData({ ...formData, reps: e.target.value })
              }
            />
            <Label htmlFor="reps" value={formData.reps}>
              Répétitions* (ex: "10" ou "8-12")
            </Label>
          </div>

          {/* Poids prévu */}
          <div className="relative">
            <input
              type="number"
              className="input peer"
              placeholder=""
              id="targetWeight"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetWeight: e.target.value
                    ? parseFloat(e.target.value)
                    : "",
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
              className="input peer"
              placeholder=""
              id="restTime"
              name="restTime"
              value={formData.restTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  restTime: e.target.value ? parseInt(e.target.value) : "",
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

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" close onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Enregistrer
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            <span className="text-red-500">*</span> Champs obligatoires
          </p>
        </form>
      </div>
    </div>
  );
}
