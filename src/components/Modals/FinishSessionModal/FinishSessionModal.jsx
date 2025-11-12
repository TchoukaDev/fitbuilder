"use client";

import { X, CheckCircle, Clock, Dumbbell } from "lucide-react";
import Button from "@/components/Buttons/Button";
import { useEffect } from "react";

export default function FinishSessionModal({
  isOpen,
  onClose,
  onConfirm,
  sessionName,
  completedCount,
  totalExercises,
  duration,
  isLoading,
}) {
  // Bloquer le scroll quand la modale est ouverte
  useEffect(() => {
    // Bloquer le scroll
    document.body.style.overflow = "hidden";

    // Réactiver le scroll quand la modale se ferme / composant détruit
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Fermeture Modale */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
        {/* Header */}
        <div className="flex justify-center items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-primary-900">
            🏁 Terminer la séance
          </h2>
        </div>

        {/* Body - Résumé */}
        <div className="p-6 space-y-4">
          <div className="bg-linear-to-br from-primary-50 to-primary-100 p-5 rounded-lg">
            <h3 className="font-bold text-xl text-primary-900 mb-4">
              {sessionName}
            </h3>

            <div className="space-y-3">
              {/* Exercices complétés */}
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-white p-2 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exercices complétés</p>
                  <p className="font-bold text-lg">
                    {completedCount} / {totalExercises}
                  </p>
                </div>
              </div>

              {/* Durée */}
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-white p-2 rounded-lg">
                  <Clock className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durée totale</p>
                  <p className="font-bold text-lg">{duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message de félicitations */}
          <div className="text-center py-4">
            <p className="text-gray-600">
              🎉 Bravo ! Voulez-vous terminer cette séance ?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            disabled={isLoading}
            close
            className="flex-1"
          >
            Annuler
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Finalisation..." : "Terminer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
