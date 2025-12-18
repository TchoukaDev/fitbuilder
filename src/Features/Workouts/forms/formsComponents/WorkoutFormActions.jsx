"use client";

import { Button, LoaderButton } from "@/Global/components";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { useRouter } from "next/navigation";

export default function WorkoutFormActions({
  errorExercises,
  clearAll,
  clearStorage = () => {},
  setExercises,
  isLoading,
  loadingText,
  submitLabel,
}) {
  const router = useRouter();
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
            onClick={() => {
              clearAll();
              clearStorage();
              setExercises([]);
              router.refresh();
              router.back();
            }}
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
