import { useEffect } from "react";

export function useAutoSave(exercises, saveProgress, delay = 30000) {
  useEffect(() => {
    if (!exercises || exercises.length === 0) return;

    const timeoutId = setTimeout(() => {
      saveProgress(exercises);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [exercises, delay, saveProgress]);
}
