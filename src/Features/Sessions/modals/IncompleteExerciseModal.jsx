"use client";

import { Button } from "@/Global/components";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";

// Modale de confirmation/annulation avant validation d'un set incomplet
export default function IncompleteExerciseModal({
  missingFields,
  onConfirm,
  onCancel,
}) {
  return createPortal(
    <ModalLayout title="Exercice incomplet" modalToClose="incompleteExercise">
      {/* Message */}
      <p className="text-center text-gray-600 mb-4">
        Certaines informations sont manquantes :
      </p>

      {/* Liste des champs manquants */}
      <ul className="space-y-2 mb-6 bg-accent-50 rounded-lg p-4">
        {/* Séries non cochées */}
        {missingFields.incompleteSets.length > 0 && (
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-accent-600 font-bold">•</span>
            <span>
              <strong>Séries non validées :</strong>{" "}
              {missingFields.incompleteSets.join(", ")}
            </span>
          </li>
        )}

        {/* Séries sans répétitions renseignées */}
        {missingFields.setsWithoutReps.length > 0 && (
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-accent-600 font-bold">•</span>
            <span>
              <strong>Répétitions manquantes :</strong>{" "}
              {missingFields.setsWithoutReps.join(", ")}
            </span>
          </li>
        )}

        {/* Séries sans poids renseigné */}
        {missingFields.setsWithoutWeight.length > 0 && (
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-accent-600 font-bold">•</span>
            <span>
              <strong>Poids manquants :</strong>{" "}
              {missingFields.setsWithoutWeight.join(", ")}
            </span>
          </li>
        )}

        {/* Effort (RPE) non saisi */}
        {missingFields.effortMissing && (
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-accent-600 font-bold">•</span>
            <span>
              <strong>Effort (RPE) non renseigné</strong>
            </span>
          </li>
        )}
      </ul>

      <p className="text-center text-sm text-gray-600 mb-6">
        Veux-tu quand même terminer cet exercice ?
      </p>

      {/* Boutons */}
      <div className="flex flex-col gap-3">
        <Button close onClick={onCancel}>
          Retour (compléter les infos)
        </Button>
        <Button onClick={onConfirm}>Terminer quand même</Button>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
