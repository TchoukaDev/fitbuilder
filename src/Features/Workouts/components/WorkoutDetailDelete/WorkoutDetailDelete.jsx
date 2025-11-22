"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useDeleteWorkout } from "@/Features/Workouts/hooks/useWorkouts";

export default function WorkoutDetailDelete({ workoutId, userId }) {
  const { mutate: deleteWorkout, isPending } = useDeleteWorkout(userId);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ?")
    ) {
      return;
    }

    deleteWorkout(workoutId, {
      onSuccess: () => {
        router.push("/workouts");
        router.refresh();
      },
      onError: (error) => {
        toast.error("Erreur lors de la suppression");
      },
    });
  };

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-2 px-4 py-2 text-accent-500 hover:bg-accent-50 border border-accent-500 rounded-md transition cursor-pointer"
    >
      <Trash2 size={18} />
      Supprimer ce plan
    </button>
  );
}
