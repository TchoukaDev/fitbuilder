import { useEffect } from "react";

/**
 * Sauvegarde automatiquement la progression après un délai donné.
 *
 * @param {any[]} exercises - Exercices à sauvegarder.
 * @param {(exercises: any[]) => void} handleSaveProgress - Fonction de sauvegarde.
 * @param {number} [delay=30000] - Délai en ms avant chaque sauvegarde.
 */
export function useAutoSave(exercises, handleSaveProgress, delay = 30000) {
  useEffect(() => {
    if (!exercises || exercises.length === 0) return;

    const timeoutId = setTimeout(() => {
      handleSaveProgress(exercises);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [exercises, delay, handleSaveProgress]);
}
