// Champs de formulaire réutilisables pour les exercices
import { Label, LoaderButton, Button } from "@/Global/components";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { FieldErrors, UseFormRegister, UseFormRegisterReturn, UseFormSetValue } from "react-hook-form";
import { ExerciseFormData } from "../utils/ExerciseSchema";

const MUSCLE_GROUPS: { label: string; muscles: string[] }[] = [
  { label: "Poitrine", muscles: ["Pectoraux supérieurs", "Pectoraux moyens", "Pectoraux inférieurs"] },
  { label: "Dos", muscles: ["Grand dorsal", "Rhomboïdes", "Trapèzes", "Érecteurs du rachis"] },
  { label: "Épaules", muscles: ["Deltoïde antérieur", "Deltoïde médial", "Deltoïde postérieur"] },
  { label: "Bras", muscles: ["Biceps", "Triceps", "Avant-bras", "Brachialis"] },
  { label: "Jambes", muscles: ["Quadriceps", "Ischio-jambiers", "Adducteurs", "Mollets"] },
  { label: "Fessiers", muscles: ["Grand fessier", "Moyen fessier"] },
  { label: "Core", muscles: ["Abdominaux", "Obliques", "Core profond"] },
  { label: "Autre", muscles: ["Corps entier"] },
];

type ExerciseFormFieldsProps = {
  register: UseFormRegister<ExerciseFormData>;
  errors: FieldErrors<ExerciseFormData>;
  isPending: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
  submitLabel: string;
  loadingLabel: string;
  watchedFields: ExerciseFormData;
  nameRegister: UseFormRegisterReturn<string>;
  nameRef: React.RefObject<HTMLInputElement | null>;
  setValue: UseFormSetValue<ExerciseFormData>;
};

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
  setValue,
}: ExerciseFormFieldsProps) {
  const primaryMuscle = watchedFields.muscle || "";
  const secondaryMuscles = watchedFields.muscles || [];

  const handleMuscleToggle = (muscleName: string) => {
    if (primaryMuscle === muscleName) {
      // Désélection du muscle primaire → le premier secondaire prend sa place
      if (secondaryMuscles.length > 0) {
        setValue("muscle", secondaryMuscles[0], { shouldValidate: true });
        setValue("muscles", secondaryMuscles.slice(1));
      } else {
        setValue("muscle", "", { shouldValidate: true });
      }
    } else if (secondaryMuscles.includes(muscleName)) {
      // Désélection d'un muscle secondaire
      setValue("muscles", secondaryMuscles.filter((m) => m !== muscleName));
    } else if (!primaryMuscle) {
      // Aucun primaire → devient le primaire
      setValue("muscle", muscleName, { shouldValidate: true });
    } else {
      // Ajout en secondaire
      setValue("muscles", [...secondaryMuscles, muscleName]);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur (formatage multiligne des erreurs Zod) */}
      {Object?.entries(errors || {})?.length > 0 && (
        <div className="formError whitespace-pre-line">
          {Object.values(errors)
            .map((error) => error?.message)
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

      {/* Sélecteur de muscles (badge grid) */}
      <div className="w-full flex flex-col gap-2">
        <p className="text-sm text-center text-primary-500 font-semibold">
          Muscles ciblés <span className="text-accent-500">*</span>
        </p>
        {/* Champ caché pour la validation RHF */}
        <input type="hidden" {...register("muscle")} />
        {/* Légende */}
        <div className="flex gap-3 justify-center text-xs text-gray-500 mb-1">
          {primaryMuscle && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-primary-500" />
              Primaire
            </span>
          )}
          {secondaryMuscles.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
              Secondaire
            </span>
          )}
        </div>
        {/* Groupes de muscles */}
        <div className="flex flex-col gap-3 w-full max-h-52 overflow-y-auto pr-1">
          {MUSCLE_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.muscles.map((muscle) => {
                  const isPrimary = primaryMuscle === muscle;
                  const isSecondary = secondaryMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => handleMuscleToggle(muscle)}
                      disabled={isPending}
                      className={[
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border",
                        isPrimary
                          ? "bg-primary-500 text-white border-primary-500"
                          : isSecondary
                            ? "bg-gray-200 text-gray-700 border-gray-300"
                            : "bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-500",
                      ].join(" ")}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {errors.muscle && (
          <p className="text-xs text-red-500 text-center">{errors.muscle.message}</p>
        )}
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
          rows={3}
          {...register("description")}
          disabled={isPending}
        />
        <Label htmlFor="description" value={watchedFields.description}>
          Description
        </Label>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="modalFooter">
          <Button
            variant="close"
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
            aria-label={submitLabel}
          >
            {submitLabel}
          </LoaderButton>
        </div>
        <RequiredFields />
      </div>
    </form>
  );
}
