import { useEffect } from "react";

/**
 * Gère le backup local d'une session dans `localStorage` (sauvegarde + restauration).
 *
 * @param {string} sessionId - Identifiant de la session.
 * @param {any[]} exercises - Exercices courants.
 * @param {(exs: any[]) => void} setExercises - Setter pour les exercices.
 * @param {Object} sessionData - Données serveur de la session (pour comparer les dates).
 */
export function useSessionBackup(
  sessionId,
  exercises,
  setExercises,
  sessionData,
) {
  // ═══════════════════════════════════════════════════════
  // 💾 Sauvegarder automatiquement
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!exercises || exercises.length === 0 || !sessionId) return;

    try {
      localStorage.setItem(
        `session-backup-${sessionId}`,
        JSON.stringify({
          exercises,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.warn("⚠️ Erreur backup:", error);
    }
  }, [exercises, sessionId]);

  // ═══════════════════════════════════════════════════════
  // 🔄 Restaurer au montage
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!sessionId) return;

    try {
      const backup = localStorage.getItem(`session-backup-${sessionId}`);
      if (!backup) {
        return;
      }

      const { exercises: backupExercises, timestamp } = JSON.parse(backup);
      const backupDate = new Date(timestamp);
      const serverDate = new Date(
        sessionData?.updatedAt || sessionData?.createdAt,
      );

      if (backupDate > serverDate) {
        setExercises(backupExercises);
      } else {
        localStorage.removeItem(`session-backup-${sessionId}`);
      }
    } catch (error) {
      console.error("❌ Erreur restauration:", error);
    }
  }, [sessionId, sessionData, setExercises]);

  // ═══════════════════════════════════════════════════════
  // 🧹 Fonction de nettoyage
  // ═══════════════════════════════════════════════════════
  /**
   * Supprime le backup de la session dans `localStorage`.
   */
  const clearBackup = () => {
    if (sessionId) {
      localStorage.removeItem(`session-backup-${sessionId}`);
    }
  };

  return { clearBackup };
}
