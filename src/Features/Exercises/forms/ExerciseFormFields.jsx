// Champs de formulaire réutilisables pour les exercices
import { Label, LoaderButton, Button } from "@/Global/components";

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
      {error && <div className="formError">{error?.message || error}</div>}

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
          Intitulé <span className="text-accent-500">*</span>
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
          Muscle <span className="text-accent-500">*</span>
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
          -- Matériel nécessaire <span className="text-accent-500">*</span> --
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
          <LoaderButton
            isLoading={isPending}
            loadingText={loadingLabel}
            type="submit"
            disabled={isPending}
            label={submitLabel}
          >
            {submitLabel}
          </LoaderButton>
        </div>
        <p className="text-xs text-gray-500 text-center">
          <span className="text-accent-500">*</span> Champs obligatoires
        </p>
      </div>
    </form>
  );
}
