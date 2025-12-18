"use client";
import { Button, Label } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";
import { useModals } from "@/Providers/Modals";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWorkoutStore } from "@/Features/Workouts/store"; // ✅ AJOUT
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";

export default function ExerciseConfiguration({ exerciseSelected }) {
  // ========================================
  // 🏪 ZUSTAND - Récupérer l'action addExercise
  // ========================================
  const addExercise = useWorkoutStore((state) => state.addExercise); // ✅ NOUVEAU
  const setStepAction = useWorkoutStore((state) => state.setStep);
  const clearAll = useWorkoutStore((state) => state.clearAll);
  const setModaleTitle = useWorkoutStore((state) => state.setModaleTitle);
  // ========================================
  // 📝 STATE LOCAL (configuration de l'exercice)
  // ========================================
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [restTime, setRestTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const { closeModal } = useModals();

  // ========================================
  // 🎨 Modifier le titre de la modale
  // ========================================
  useEffect(() => {
    setModaleTitle(`Configurer l'exercice "${exerciseSelected?.name}"`);
  }, [exerciseSelected?.name, setModaleTitle]);

  // ========================================
  // ✅ SOUMETTRE L'EXERCICE
  // ========================================
  const handleSubmit = () => {
    setError("");

    // Validation
    if (sets === "" || reps === "" || targetWeight === "" || restTime === "") {
      setError("Veuillez compléter tous les champs obligatoires");
      return;
    }

    // Créer l'exercice avec la config
    const exerciseToAdd = {
      ...exerciseSelected,
      sets: parseInt(sets) || 0,
      reps: reps,
      targetWeight: parseFloat(targetWeight) || 0,
      restTime: parseInt(restTime) || 0,
      notes: notes,
    };

    // ✅ AJOUTER dans le store Zustand
    addExercise(exerciseToAdd);
    clearAll();
    setStepAction(1);
    toast.success("Exercice ajouté !");
    closeModal("workoutSelectExercise");
  };

  // ========================================
  // 🎨 RENDER
  // ========================================
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Séries */}
      <div className="relative">
        <input
          className="input peer"
          type="number"
          onKeyDown={handleKeyDown}
          placeholder=""
          onChange={(e) => setSets(e.target.value)}
          value={sets}
          required
        />
        <Label htmlFor="sets" value={sets}>
          Nombre de séries<span className="text-accent-500">*</span>
        </Label>
      </div>

      {/* Répétitions */}
      <div className="relative">
        <input
          className="input peer"
          placeholder=""
          onChange={(e) => setReps(e.target.value)}
          value={reps}
          required
        />
        <Label htmlFor="reps" value={reps}>
          Répétitions<span className="text-accent-500">*</span> (ex: "10" ou
          "8-12")
        </Label>
      </div>

      {/* Charge */}
      <div className="relative">
        <input
          className="input peer"
          type="number"
          onKeyDown={handleKeyDown}
          placeholder=""
          onChange={(e) => setTargetWeight(e.target.value)}
          value={targetWeight}
          required
        />
        <Label htmlFor="weight" value={targetWeight}>
          Poids prévu<span className="text-accent-500">*</span> (kg)
        </Label>
      </div>

      {/* Repos */}
      <div className="relative">
        <input
          className="input peer"
          placeholder=""
          type="number"
          onKeyDown={handleKeyDown}
          onChange={(e) => setRestTime(e.target.value)}
          value={restTime}
          required
        />
        <Label htmlFor="rest" value={restTime}>
          Temps de repos<span className="text-accent-500">*</span> (secondes)
        </Label>
      </div>

      {/* Commentaire (optionnel) */}
      <div className="relative">
        <textarea
          rows={3}
          className="input peer"
          placeholder=""
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
        <Label htmlFor="notes" value={notes}>
          Commentaires (Optionnel)
        </Label>
        <p className="text-xs text-gray-500 mt-1">
          Ex: "Tempo lent", "Prise large", etc.
        </p>
      </div>

      {/* Erreur */}
      {error && <p className="formError my-3">{error}</p>}

      {/* Actions */}
      <div className="modalFooter">
        {/* Bouton retour */}
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

        {/* Bouton validation */}
        <Button type="button" onClick={handleSubmit}>
          Ajouter
        </Button>
      </div>

      <RequiredFields />
    </div>
  );
}
