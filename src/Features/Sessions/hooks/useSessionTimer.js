import { useState, useEffect } from "react";

export function useSessionTimer(startedAt) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!startedAt) return;

    //   Temps de départ
    const startTime = new Date(startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      // Temps écoulé depuis le départ
      const elapsed = Math.floor((now - startTime) / 1000);

      // mise à jour du state
      if (!isNaN(elapsed) && elapsed >= 0) {
        setElapsedTime(elapsed);
        setIsMounted(true);
      }
    };

    updateTimer(); // Calcul immédiat au montage

    //   Recalcul toutes les secondes
    const interval = setInterval(updateTimer, 1000);

    //   Cleaning
    return () => clearInterval(interval);
  }, [startedAt]);

  // Format
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    isMounted,
  };
}
