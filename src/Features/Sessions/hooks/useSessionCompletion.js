// hooks/useSessionCompletion.js

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useDeleteSession } from "@/hooks/useSessions";

export function useSessionCompletion(
  sessionId,
  userId,
  clearBackup,
  setIsSaving,
  formattedTime, // ✅ Recevoir formattedTime
) {
  const router = useRouter();
  const { mutate: deleteSession } = useDeleteSession(userId);

  // ✅ useCallback pour éviter de recréer la fonction à chaque render
  const saveProgress = async (exercises) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises,
          duration: formattedTime,
        }),
      });

      if (!response.ok) throw new Error("Erreur sauvegarde");

      clearBackup();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Nettoyer les données
  const cleanExercisesData = (exercises) => {
    return exercises.map((ex) => ({
      ...ex,
      actualSets:
        ex.actualSets?.map((set) => ({
          ...set,
          reps: set.reps ?? 0,
          weight: set.weight ?? 0,
          completed: set.completed ?? false,
        })) || [],
      effort: ex.effort ?? null,
      notes: ex.notes ?? "",
    }));
  };

  // ✅ Finaliser la session
  const finishSession = async (exercises) => {
    setIsSaving(true);

    try {
      const cleanedExercises = cleanExercisesData(exercises);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: cleanedExercises,
          duration: formattedTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      clearBackup();
      toast.success("🎉 Séance terminée !");
      router.push("/sessions");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur finalisation");
      setIsSaving(false);
    }
  };

  // ✅ Annuler la session
  const cancelSession = () => {
    setIsSaving(true);

    deleteSession(sessionId, {
      onSuccess: () => {
        toast.success("Session annulée");
        clearBackup();
        router.push("/workouts");
        router.refresh();
      },
      onError: () => {
        toast.error("Erreur annulation");
        setIsSaving(false);
      },
    });
  };

  return {
    saveProgress,
    finishSession,
    cancelSession,
  };
}
