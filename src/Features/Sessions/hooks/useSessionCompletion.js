// hooks/useSessionCompletion.js

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDeleteSession } from "./useSessions";
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
  userId,
  clearBackup,
  calculateFormattedTime, // ✅ Fonction au lieu de valeur
) {
  const { closeAllModals } = useModals();
  const router = useRouter();
  const { mutate: deleteSession } = useDeleteSession(userId);

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
          exercises: exercisesToSave,
          duration: calculateFormattedTime(), // ✅ Appeler la fonction
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

  // ✅ Finaliser la session
  /**
   * Finalise la session : envoie toutes les données et redirige l'utilisateur.
   *
   * @param {any[]} exercisesToFinish - Exercices de la session (optionnel, utilise le store par défaut).
   */
  const finishSession = async (exercisesToFinish = exercises) => {
    setIsSaving(true);

    try {
      const cleanedExercises = cleanExercisesData(exercisesToFinish);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: cleanedExercises,
          duration: calculateFormattedTime(), // ✅ Appeler la fonction
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // L'API retourne { error: "string", message: "string" }
        throw new Error(error.message || error.error || "Erreur inconnue");
      }

      clearBackup();
      closeAllModals();
      toast.success("🎉 Séance terminée !");
      setTimeout(() => resetSession(sessionId), 1000);
      router.push("/sessions");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur finalisation");
      setIsSaving(false);
      // ⚠️ Ne pas nettoyer le state en cas d'erreur pour permettre une nouvelle tentative
    }
  };

  // ✅ Annuler la session
  /**
   * Annule la session (suppression côté serveur + nettoyage backup).
   */
  const cancelSession = () => {
    setIsSaving(true);

    deleteSession(sessionId, {
      onSuccess: () => {
        closeAllModals();
        clearBackup();
        setTimeout(() => resetSession(sessionId), 1000);
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
