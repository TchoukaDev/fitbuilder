"use client";

import { Play } from "lucide-react";
import { LoaderButton } from "@/Global/components";
import { useStartNewSession } from "@/Features/Sessions/hooks/useQuerySessions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Workout } from "@/types/workout";


type StartWorkoutButtonProps = {
  userId: string;
  workout: Workout;
  full?: boolean;
}
export default function StartWorkoutButton({ userId, workout, full }: StartWorkoutButtonProps) {
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
      aria-label="Démarrer la séance"
      full={full}
    >
      <Play size={20} />
      Démarrer la séance
    </LoaderButton>
  );
}
