"use client";

import { X, CheckCircle, Clock, Dumbbell } from "lucide-react";
import Button from "@/Global/components/ui/Button";
import { useBlockScroll } from "@/Global/hooks/useBlockScroll";
import { useModals } from "@/Providers/ModalContext";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";

// Modale de confirmation de fin de session
export default function FinishSessionModal({
  onConfirm,
  sessionName,
  completedCount,
  totalExercises,
  duration,
  isLoading,
}) {
  const { closeModal } = useModals();
  useBlockScroll();

  return createPortal(
    <ModalLayout title="🏁 Terminer la séance" modalToClose="finishSession">
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
          onClick={() => closeModal("finishSession")}
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
    </ModalLayout>,
    document.getElementById("portal-root"),
  );
}
