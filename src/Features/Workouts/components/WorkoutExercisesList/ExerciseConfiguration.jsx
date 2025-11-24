import Button from "@/Global/components/ui/Button";
import Label from "@/Global/components/ui/FormsComponents/Label/Label";
import { useModals } from "@/Providers/ModalContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Composant pour configurer l'exercise à ajouter dans l'entraînement
export default function ExerciseConfiguration({
  exerciseSelected,
  setStep,
  setSelectedExerciseId,
  onSelectExercise,
  onSetTitle,
}) {
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [restTime, setRestTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  const { closeModal } = useModals();

  const handleSubmit = () => {
    if (sets === "" || reps === "" || targetWeight === "" || restTime === "") {
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
    toast.success("Exercice ajouté!");
    onSelectExercise(exerciseToAdd);
    closeModal("workoutSelectExercise");
  };

  useEffect(() =>
    onSetTitle(`Configurer l'exercice "${exerciseSelected.name}"`),
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        {/* Séries */}
        <input
          className="input peer"
          type="number"
          placeholder=""
          onChange={(e) =>
            setSets(e.target.value ? parseInt(e.target.value) : 0)
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
          placeholder=""
          onChange={(e) => setReps(e.target.value || 0)}
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
            setTargetWeight(e.target.value ? parseFloat(e.target.value) : 0)
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
            setRestTime(e.target.value ? parseInt(e.target.value) : 0)
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
      {/* Erreur formulaire  */}
      {error && (
        <p className="formError my-3">
          Certains champs obligatoires ne sont pas remplis.
        </p>
      )}
      <div className="flex items-center gap-3">
        {/* Bouton retour Etape 1 */}
        <Button
          type="button"
          close
          onClick={() => {
            setStep(1);
            setSelectedExerciseId(null);
          }}
        >
          Retour
        </Button>{" "}
        {/* Bouton validation */}
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
