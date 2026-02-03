"use client";

import { Button, LoaderButton } from "@/Global/components";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { useModals } from "@/Providers/Modals";

interface WorkoutFormActionsProps {
  errorExercises: string | null,
  isLoading: boolean,
  loadingText: string,
  submitLabel: string
}

export default function WorkoutFormActions({
  errorExercises,
  isLoading,
  loadingText,
  submitLabel,
}: WorkoutFormActionsProps) {
  const { openModal } = useModals();
  return (
    <>
      {/* ⚠️ Message d'erreur pour les exercices */}
      {errorExercises && (
        <div className="formError text-center">{errorExercises}</div>
      )}

      {/* 🔘 Boutons d'action */}
      <div className="flex flex-col   gap-3 items-center bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col w-full md:flex-row justify-center md:justify-evenly gap-3 items-center">
          {/* Bouton Annuler */}
          <Button
            type="button"
            close
            onClick={() => openModal("confirmRouterBack")}
            aria-label="Annuler"
          >
            Annuler
          </Button>

          {/* Bouton Créer */}
          <LoaderButton
            isLoading={isLoading}
            loadingText={loadingText}
            type="submit"
          >
            {submitLabel}
          </LoaderButton>
        </div>
        <div className="flex  ">
          <RequiredFields />
        </div>
      </div>
    </>
  );
}
