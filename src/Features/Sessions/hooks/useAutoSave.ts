import { SessionExercise } from "@/types/SessionExercise";
import { useEffect } from "react";

/**
 * Sauvegarde automatiquement la progression après un délai donné.
 */

interface UseAutoSaveProps {
  exercises: SessionExercise[];
  handleSaveProgress: (exercises: SessionExercise[]) => void;
  delay?: number;
}

export function useAutoSave({exercises, handleSaveProgress, delay = 30000}: UseAutoSaveProps) {
  useEffect(() => {
    if (!exercises || exercises.length === 0) return;

    const timeoutId = setTimeout(() => {
      handleSaveProgress(exercises);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [exercises, delay, handleSaveProgress]);
}
