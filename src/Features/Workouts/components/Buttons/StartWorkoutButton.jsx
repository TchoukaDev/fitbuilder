"use client";

import { Play } from "lucide-react";
import { Button } from "@/Global/components";
import { useCreateSession } from "@/Features/Sessions/hooks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function StartWorkoutButton({ userId, workout, small }) {
  const { mutate: createSession, isPending } = useCreateSession(userId);
  const router = useRouter();
  const handleStart = () => {
    createSession(
      {
        templateId: workout._id,
        templateName: workout.name,
        exercises: workout.exercises,
      },
      {
        onSuccess: (data) => {
          router.push(`/sessions/${data.sessionId}`);
        },
        onError: (error) => {
          toast.error(error.message || "Une erreur est survenue"); //
        },
      },
    );
  };
  return (
    <Button
      disabled={isPending}
      onClick={handleStart}
      title="Démarrer la séance"
      label="Démarrer la séance"
      width="w-12 md:w-auto"
    >
      {" "}
      <Play size={20} />
      <span className="hidden md:inline">Démarrer la séance</span>
    </Button>
  );
}
