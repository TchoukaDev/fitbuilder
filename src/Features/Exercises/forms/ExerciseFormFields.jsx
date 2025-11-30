// Champs de formulaire réutilisables pour les exercices
import { Label, LoaderButton, Button } from "@/Global/components";

export default function ExerciseFormFields({
  register,
  errors,
  isPending,
  isSubmitting,
  onSubmit,
  onClose,
  submitLabel = "Valider",
  loadingLabel = "Validation en cours...",
  watchedFields,
  nameRegister,
  nameRef,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur (formatage multiligne des erreurs Zod) */}
      {Object?.entries(errors || {})?.length > 0 && (
        <div className="formError whitespace-pre-line">
          {Object.values(errors)
            .map((error) => error.message)
            .join("\n")}
        </div>
      )}

      {/* Nom de l'exercice */}
      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="name"
          name="name"
          {...nameRegister}
          ref={(e) => {
            nameRegister.ref(e);
            nameRef.current = e;
          }}
          disabled={isPending}
        />
        <Label htmlFor="name" value={watchedFields.name}>
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
          {...register("muscle")}
          disabled={isPending}
        />
        <Label htmlFor="muscle" value={watchedFields.muscle}>
          Muscle <span className="text-accent-500">*</span>
        </Label>
      </div>

      {/* Matériel nécessaire */}
      <div className="flex flex-col gap-2 items-center">
        <label
          htmlFor="equipment"
          className="text-sm text-center text-primary-500 font-semibold"
        >
          Matériel nécessaire: <span className="text-accent-500">*</span>
        </label>
        <select
          className="input py-2 peer"
          id="equipment"
          name="equipment"
          {...register("equipment")}
          aria-label="Matériel nécessaire"
          disabled={isPending}
        >
          <option value="" className="font-semibold">
            -- Sélectionner un équipement --
          </option>
          <option value="Poids du corps">Poids du corps</option>
          <option value="Haltères">Haltères</option>
          <option value="Barre">Barre</option>
          <option value="Machine">Machine</option>
          <option value="Élastique">Élastique</option>
        </select>
      </div>
      {/* Description */}
      <div className="relative">
        <textarea
          className="input peer"
          placeholder=""
          id="description"
          name="description"
          rows="3"
          {...register("description")}
          disabled={isPending}
        />
        <Label htmlFor="description" value={watchedFields.description}>
          Description
        </Label>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-4">
          <Button
            close
            onClick={onClose}
            type="button"
            disabled={isPending || isSubmitting}
          >
            Fermer
          </Button>
          <LoaderButton
            isLoading={isPending || isSubmitting}
            loadingText={loadingLabel}
            type="submit"
            disabled={isPending || isSubmitting}
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
