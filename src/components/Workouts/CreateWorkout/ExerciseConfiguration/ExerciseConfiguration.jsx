import Button from "@/components/Buttons/Button";
import Label from "@/components/Forms/FormsComponents/Label/Label";
import { useState } from "react";

export default function ExerciseConfiguration({
  exerciseSelected,
  setStep,
  setSelectedExerciseId,
  onSelectExercise,
  onCloseExerciseSelector,
}) {
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [restTime, setRestTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (
      !sets.trim() ||
      !reps.trim() ||
      !targetWeight.trim() ||
      !restTime.trim()
    ) {
      setError(true);
      return;
    }
    const exerciseToAdd = {
      ...exerciseSelected,
      sets,
      reps,
      targetWeight,
      restTime,
      notes,
    };
    onSelectExercise(exerciseToAdd);
    onCloseExerciseSelector();
  };
  return (
    <div className="flex flex-col items-center gap-5">
      <h2>Configurer l'exercice "{exerciseSelected.name}"</h2>
      <div className="relative">
        {/* Séries */}
        <input
          className="input peer"
          type="number"
          placeholder=""
          onChange={(e) =>
            setSets(e.target.value ? parseInt(e.target.value) : "")
          }
          required
        />
        <Label htmlFor="sets" value={sets}>
          Nombre de séries*
        </Label>
      </div>{" "}
      {/* Répétitions */}
      <div className="relative">
        <input
          className="input peer"
          type="number"
          placeholder=""
          onChange={(e) =>
            setReps(e.target.value ? parseInt(e.target.value) : "")
          }
          required
        />
        <Label htmlFor="reps" value={reps}>
          Répétitions* (ex: "10" ou "8-12")
        </Label>
      </div>{" "}
      {/* Charge */}
      <div className="relative">
        <input
          className="input peer"
          type="number"
          placeholder=""
          onChange={(e) =>
            setTargetWeight(e.target.value ? parseFloat(e.target.value) : "")
          }
          required
        />
        <Label htmlFor="weight" value={targetWeight}>
          Poids prévu (kg)*
        </Label>
      </div>{" "}
      {/* Repos */}
      <div className="relative">
        <input
          className="input peer"
          placeholder=""
          type="number"
          onChange={(e) =>
            setRestTime(e.target.value ? parseInt(e.target.value) : "")
          }
          required
        />
        <Label htmlFor="rest" value={restTime}>
          Temps de repos (secondes)*
        </Label>
      </div>{" "}
      {/* Notes (optionnel) */}
      <div className="relative">
        <textarea
          rows={3}
          className="input peer"
          placeholder=""
          type="text"
          onChange={(e) => setNotes(e.target.value)}
        />
        <Label htmlFor="notes" value={notes}>
          Notes (Optionnel)
        </Label>
        <p className="text-xs text-gray-500 mt-1">
          Ex: "Tempo lent", "Prise large", etc.
        </p>
      </div>{" "}
      {error && (
        <p className="formError my-3">
          Certains champs obligatoires ne sont pas remplis.
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          close
          onClick={() => {
            setStep(1);
            setSelectedExerciseId(null);
          }}
        >
          Retour
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Ajouter
        </Button>
      </div>{" "}
      <p className="text-xs text-gray-500 text-center">
        <span className="text-red-500">*</span> Champs obligatoires
      </p>
    </div>
  );
}
