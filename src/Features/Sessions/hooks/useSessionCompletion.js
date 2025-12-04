// hooks/useSessionCompletion.js

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDeleteSession } from "./useSessions";

/**
 * Fournit les actions de fin de session (sauvegarder, terminer, annuler).
 *
 * ✅ OPTIMISATION PERFORMANCE :
 * formattedTime est maintenant une FONCTION au lieu d'une valeur.
 * Cela évite que useSessionCompletion se recrée à chaque changement de timer.
 *
 * @param {string} sessionId - Identifiant de la session.
 * @param {string} userId - Identifiant de l'utilisateur.
 * @param {Function} clearBackup - Fonction pour nettoyer le backup local.
 * @param {Function} setIsSaving - Setter d'état de sauvegarde.
 * @param {() => string} calculateFormattedTime - Fonction pour calculer le temps formaté à la demande.
 */
export function useSessionCompletion(
  sessionId,
  userId,
  clearBackup,
  setIsSaving,
  calculateFormattedTime, // ✅ Fonction au lieu de valeur
) {
  const router = useRouter();
  const { mutate: deleteSession } = useDeleteSession(userId);

  // ✅ useCallback pour éviter de recréer la fonction à chaque render
  /**
   * Sauvegarde la progression courante de la session (PATCH partiel).
   *
   * @param {any[]} exercises - Liste des exercices à sauvegarder.
   */
  const saveProgress = async (exercises) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises,
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
   * @param {any[]} exercises - Exercices bruts.
   * @returns {any[]} Exercices nettoyés.
   */
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
  /**
   * Finalise la session : envoie toutes les données et redirige l'utilisateur.
   *
   * @param {any[]} exercises - Exercices de la session.
   */
  const finishSession = async (exercises) => {
    setIsSaving(true);

    try {
      const cleanedExercises = cleanExercisesData(exercises);

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
      toast.success("🎉 Séance terminée !");
      router.push("/sessions");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur finalisation");
      setIsSaving(false);
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
