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
  const [weight, setWeight] = useState("");
  const [rest, setRest] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (!sets.trim() || !reps.trim() || !weight.trim() || !rest.trim()) {
      setError(true);
      return;
    }
    const exerciseToAdd = {
      ...exerciseSelected,
      sets,
      reps,
      weight,
      rest,
      notes,
    };
    onSelectExercise(exerciseToAdd);
    onCloseExerciseSelector();
  };
  return (
    <div className="flex flex-col gap-3">
      <h2>Configurer l'exercice {exerciseSelected.name}</h2>
      <div className="relative">
        {/* Séries */}
        <input
          className="input peer"
          type="number"
          onChange={(e) => setSets(e.target.value)}
          required
        />
        <Label htmlFor="sets" value={sets}>
          Nombre de séries
        </Label>
      </div>{" "}
      {/* Répétitions */}
      <div className="relative">
        <input
          className="input peer"
          type="number"
          onChange={(e) => setReps(e.target.value)}
          required
        />
        <Label htmlFor="reps" value={reps}>
          Nombre de répétitions
        </Label>
      </div>{" "}
      {/* Charge */}
      <div className="relative">
        <input
          className="input peer"
          type="text"
          onChange={(e) => setWeight(e.target.value)}
          required
        />
        <Label htmlFor="weight" value={weight}>
          Charge cible
        </Label>
      </div>{" "}
      {/* Repos */}
      <div className="relative">
        <input
          className="input peer"
          type="text"
          onChange={(e) => setRest(e.target.value)}
          required
        />
        <Label htmlFor="rest" value={rest}>
          Temps de repos
        </Label>
      </div>{" "}
      {/* Notes (optionnel) */}
      <div className="relative">
        <input
          className="input peer"
          type="text"
          onChange={(e) => setNotes(e.target.value)}
        />
        <Label htmlFor="rest" value={notes}>
          Notes (Optionnel)
        </Label>
      </div>{" "}
      {error && (
        <p className="formError my-3">
          Veuillez compléter tous les champs du formulaire
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
      </div>
    </div>
  );
}
