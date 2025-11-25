"use client";

import { Trash2 } from "lucide-react";
import { useModals } from "@/Providers/Modals";
import { Button } from "@/Global/components";

export default function WorkoutDeleteButton({ workoutId, sm }) {
  const { openModal } = useModals();

  return (
    <>
      <Button
        width={sm ? "w-12 md:w-auto" : null}
        close
        onClick={() => openModal("deleteConfirm", { id: workoutId })}
        title="Supprimer"
        label="Supprimer l'entraînement"
      >
        {sm ? (
          <Trash2 size={20} />
        ) : (
          <>
            <Trash2 size={18} /> Supprimer ce plan
          </>
        )}
      </Button>
    </>
  );
}
