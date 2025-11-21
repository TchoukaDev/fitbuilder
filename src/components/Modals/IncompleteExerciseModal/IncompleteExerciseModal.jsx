// components/Modals/IncompleteExerciseModal/IncompleteExerciseModal.jsx

"use client";

import Button from "@/components/Buttons/Button";
import { useBlockScroll } from "@/hooks/useBlockScroll";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

export default function IncompleteExerciseModal({
  missingFields,
  onConfirm,
  onCancel,
}) {
  useBlockScroll();

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-accent-600" />
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          Exercice incomplet
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 mb-4">
          Certaines informations sont manquantes :
        </p>

        {/* Liste des champs manquants */}
        <ul className="space-y-2 mb-6 bg-accent-50 rounded-lg p-4">
          {missingFields.incompleteSets.length > 0 && (
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-accent-600 font-bold">•</span>
              <span>
                <strong>Séries non validées :</strong>{" "}
                {missingFields.incompleteSets.join(", ")}
              </span>
            </li>
          )}

          {missingFields.setsWithoutReps.length > 0 && (
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-accent-600 font-bold">•</span>
              <span>
                <strong>Répétitions manquantes :</strong>{" "}
                {missingFields.setsWithoutReps.join(", ")}
              </span>
            </li>
          )}

          {missingFields.setsWithoutWeight.length > 0 && (
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-accent-600 font-bold">•</span>
              <span>
                <strong>Poids manquants :</strong>{" "}
                {missingFields.setsWithoutWeight.join(", ")}
              </span>
            </li>
          )}

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
            ← Retour (compléter les infos)
          </Button>
          <Button onClick={onConfirm}>Terminer quand même</Button>
        </div>
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
