import { useEffect } from "react";

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
      console.log("💾 Backup sauvegardé");
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

      console.log("📦 Backup trouvé:", backupDate.toLocaleString());

      if (backupDate > serverDate) {
        setExercises(backupExercises);
      } else {
        localStorage.removeItem(`session-backup-${sessionId}`);
      }
    } catch (error) {
      console.error("❌ Erreur restauration:", error);
    }
  }, [sessionId]);

  // ═══════════════════════════════════════════════════════
  // 🧹 Fonction de nettoyage
  // ═══════════════════════════════════════════════════════
  const clearBackup = () => {
    if (sessionId) {
      localStorage.removeItem(`session-backup-${sessionId}`);
    }
  };

  return { clearBackup };
}
