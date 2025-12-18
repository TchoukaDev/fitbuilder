// hooks/useSessionCompletion.js

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  useCancelPlannedSession,
  useDeleteSession,
  useFinishSession,
} from "./useSessions";
import { useSessionStore } from "../store";
import { useModals } from "@/Providers/Modals";

/**
 * Fournit les actions de fin de session (sauvegarder, terminer, annuler).
 * Utilise le store Zustand pour gérer l'état de sauvegarde et les exercises.
 *
 * ✅ OPTIMISATION PERFORMANCE :
 * formattedTime est maintenant une FONCTION au lieu d'une valeur.
 * Cela évite que useSessionCompletion se recrée à chaque changement de timer.
 *
 * @param {string} sessionId - Identifiant de la session.
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {Function} clearBackup - Fonction pour nettoyer le backup local.
 * @param {() => string} calculateFormattedTime - Fonction pour calculer le temps formaté à la demande.
 */
export function useSessionCompletion(
  sessionId,
  sessionData,
  userId,
  clearBackup,
  calculateFormattedTime, // ✅ Fonction au lieu de valeur
) {
  const isPlanned = sessionData.isPlanned;
  const { closeAllModals } = useModals();
  const router = useRouter();
  const { mutate: deleteSession } = useDeleteSession(userId);
  const { mutate: cancelPlannedSession } = useCancelPlannedSession(userId);
  const { mutate: finishSessionMutation } = useFinishSession(userId, sessionId);
  // Store
  const exercises = useSessionStore((state) => state.exercises);
  const setIsSaving = useSessionStore((state) => state.setIsSaving);
  const resetSession = useSessionStore((state) => state.resetSession);

  // ✅ useCallback pour éviter de recréer la fonction à chaque render
  /**
   * Sauvegarde la progression courante de la session (PATCH partiel).
   *
   * @param {any[]} exercisesToSave - Liste des exercices à sauvegarder (optionnel, utilise le store par défaut).
   */
  const saveProgress = async (exercisesToSave = exercises) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          exercises: exercisesToSave,
          duration: calculateFormattedTime(), // ✅ Appeler la fonction
        }),
      });

      if (!response.ok) throw new Error("Erreur sauvegarde");
      toast.success("Progression sauvegardée");

      clearBackup();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Nettoyer les données
  /**
   * Nettoie / normalise les données des exercices avant envoi au backend.
   *
   * @param {any[]} exercisesToClean - Exercices bruts.
   * @returns {any[]} Exercices nettoyés.
   */
  const cleanExercisesData = (exercisesToClean) => {
    return exercisesToClean.map((ex) => ({
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

  /**
   * Finalise la session : envoie toutes les données et redirige l'utilisateur.
   *
   * @param {any[]} exercisesToFinish - Exercices de la session (optionnel, utilise le store par défaut).
   */
  const finishSession = async (exercisesToFinish = exercises) => {
    setIsSaving(true);

    const cleanedExercises = cleanExercisesData(exercisesToFinish);
    const duration = calculateFormattedTime();
    finishSessionMutation(
      { exercises: cleanedExercises, duration },
      {
        onSuccess: () => {
          toast.success("🎉 Séance terminée avec succès !");
          clearBackup();
          closeAllModals();
          setTimeout(() => resetSession(sessionId), 1000);
          router.push("/sessions");
          router.refresh();
          setIsSaving(false);
        },
        onError: () => {
          toast.error("Erreur lors de la finalisation de la session");
          setIsSaving(false);
        },
      },
    );
  };

  /**
   * Annule la session (suppression côté serveur + nettoyage backup).
   */
  const cancelSession = () => {
    setIsSaving(true);

    if (isPlanned) {
      cancelPlannedSession(sessionId, {
        onSuccess: () => {
          closeAllModals();
          clearBackup();
          setTimeout(() => resetSession(sessionId), 1000);
          router.push("/sessions");
          router.refresh();
        },
        onError: () => {
          toast.error("Erreur lors de l'annulation de la session");
          setIsSaving(false);
        },
      });
    } else {
      deleteSession(sessionId, {
        onSuccess: () => {
          toast.success("Session d'entraînement annulée");
          closeAllModals();
          clearBackup();
          setTimeout(() => resetSession(sessionId), 1000);
          router.push("/workouts");
          router.refresh();
        },
        onError: () => {
          toast.error("Erreur lors de l'annulation de la session");
          setIsSaving(false);
        },
      });
    }
  };

  return {
    saveProgress,
    finishSession,
    cancelSession,
  };
}
