"use client";

// Bouton qui ouvre une modale de confirmation pour supprimer un plan d'entraînement.
import { Trash2 } from "lucide-react";
import { useModals } from "@/Providers/Modals";
import { Button } from "@/Global/components";

type WorkoutDeleteButtonProps = {
  workoutId: string;
  sm?: boolean;
}

export default function WorkoutDeleteButton({ workoutId, sm }: WorkoutDeleteButtonProps) {
  const { openModal } = useModals();

  return (
    <>
      <Button
        width={sm ? "w-12 md:w-auto" : null}
        close
        onClick={() => openModal("deleteConfirm", { id: workoutId })}
        title="Supprimer"
        aria-label="Supprimer l'entraînement"
      >
        <Trash2 size={18} />{" "}
        <span className="hidden md:inline">Supprimer ce plan</span>
      </Button>
    </>
  );
}
