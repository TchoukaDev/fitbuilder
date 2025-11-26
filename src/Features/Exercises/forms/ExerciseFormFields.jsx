// Champs de formulaire réutilisables pour les exercices
import { Button, Label } from "@/Global/components";
import { ClipLoader } from "react-spinners";

export default function ExerciseFormFields({
  name,
  muscle,
  description,
  equipment,
  error,
  isPending,
  onNameChange,
  onMuscleChange,
  onDescriptionChange,
  onEquipmentChange,
  onSubmit,
  onClose,
  submitLabel = "Valider",
  loadingLabel = "Validation en cours...",
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur */}
      {error && <div className="formError">{error}</div>}

      {/* Nom de l'exercice */}
      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="name"
          name="name"
          value={name}
          onChange={onNameChange}
          disabled={isPending}
        />
        <Label htmlFor="name" value={name}>
          Intitulé*
        </Label>
      </div>

      {/* Muscle ciblé */}
      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="muscle"
          name="muscle"
          value={muscle}
          onChange={onMuscleChange}
          disabled={isPending}
        />
        <Label htmlFor="muscle" value={muscle}>
          Muscle*
        </Label>
      </div>

      {/* Matériel nécessaire */}
      <select
        className="input py-5 peer"
        id="equipment"
        name="equipment"
        value={equipment}
        onChange={onEquipmentChange}
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

      {/* Description */}
      <div className="relative">
        <textarea
          className="input peer"
          placeholder=""
          id="description"
          name="description"
          rows="3"
          value={description}
          onChange={onDescriptionChange}
          disabled={isPending}
        />
        <Label htmlFor="description" value={description}>
          Description
        </Label>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-4">
          <Button close onClick={onClose} type="button" disabled={isPending}>
            Fermer
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <span className="flex items-center gap-2">
                <span>{loadingLabel}</span>
                <ClipLoader size={15} color="#e8e3ff" />
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
        <div className="text-xs text-end">(*) champs obligatoires</div>
      </div>
    </form>
  );
}
