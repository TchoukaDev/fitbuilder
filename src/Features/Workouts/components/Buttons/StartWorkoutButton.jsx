"use client";

import { Play } from "lucide-react";
import { LoaderButton } from "@/Global/components";
import { useStartNewSession } from "@/Features/Sessions/hooks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function StartWorkoutButton({ userId, workout }) {
  const { mutate: startSession, isPending: isStarting } =
    useStartNewSession(userId);
  const router = useRouter();
  const handleStart = () => {
    startSession(
      {
        workoutId: workout.id,
        workoutName: workout.name,
        exercises: workout.exercises,
      },
      {
        onSuccess: (data) => {
          router.push(`/sessions/${data.sessionId}`);
        },
        onError: (error) => {
          toast.error(error.message || "Erreur lors du démarrage de la séance");
        },
      },
    );
  };
  return (
    <LoaderButton
      isLoading={isStarting}
      loadingText="Démarrage en cours"
      type="button"
      onClick={handleStart}
      title="Démarrer la séance"
      label="Démarrer la séance"
      width="w-12 md:w-auto"
    >
      {" "}
      <Play size={20} />
      <span className="hidden md:inline">Démarrer la séance</span>
    </LoaderButton>
  );
}
