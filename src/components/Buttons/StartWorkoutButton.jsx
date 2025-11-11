"use client";

import { Play } from "lucide-react";
import Button from "./Button";
import { useCreateSession } from "@/hooks/useSessions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function StartWorkoutButton({ userId, workout }) {
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
    <Button disabled={isPending} onClick={handleStart}>
      {" "}
      <Play size={20} />
      Commencer cette séance
    </Button>
  );
}
