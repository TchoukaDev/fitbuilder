import { useEffect, useState } from "react";
import { useTimerEffects } from "./useTimerEffects";
import { useModals } from "@/Providers/Modals";
import { useBlockScroll } from "@/Global/hooks";

export const useRestTimer = (safeInitialTime: number) => {
  // ═══════════════════════════════════════════════════════
  // 📊 STATES
  // ═══════════════════════════════════════════════════════
  // Temps restant en secondes
  const [remainingTime, setRemainingTime] = useState(safeInitialTime);

  // Timer en cours ou en pause
  const [isRunning, setIsRunning] = useState(false);

  // Temps personnalisé (pour modification manuelle)
  const [customTime, setCustomTime] = useState(safeInitialTime);

  // Hook pour effets de fin de Timer
  const { triggerTimerComplete } = useTimerEffects();

  // Hook pour fermer la modale
  const { closeModal } = useModals();

  // Hook pour bloquer le scroll
  useBlockScroll();

  // ═══════════════════════════════════════════════════════
  // ⏱️ EFFET : Décompte du timer
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    // Si le timer n'est pas en cours, ne rien faire
    if (!isRunning) return;

    // Si le temps est écoulé, arrêter
    if (remainingTime <= 0) {
      setIsRunning(false);
      triggerTimerComplete();
      return;
    }

    // ⏰ Décrémenter chaque seconde
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setIsRunning(false); // Arrêter automatiquement à 0
          triggerTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 🧹 Cleanup : supprimer l'interval quand le composant se démonte ou isRunning change
    return () => clearInterval(interval);
  }, [isRunning, remainingTime]);

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════

  // Démarrer/Reprendre le timer
  const handleStart = () => {
    setIsRunning(true);
  };

  // Mettre en pause
  const handlePause = () => {
    setIsRunning(false);
  };

  // Passer le repos (skip)
  const handleSkip = () => {
    setIsRunning(false);
    closeModal("restTimer"); // Fermer la modale
  };

  // Réinitialiser avec le temps initial
  const handleReset = () => {
    setIsRunning(false);
    setRemainingTime(safeInitialTime);
    setCustomTime(safeInitialTime);
  };

  // Appliquer un temps personnalisé
  const handleApplyCustomTime = (option: number) => {
    let newTime = customTime;

    if (isNaN(option)) {
      newTime = customTime;
    } else {
      newTime = option;
      setCustomTime(newTime);
    }
    if (newTime > 0) {
      setRemainingTime(newTime);
      setIsRunning(false); // Arrêter le timer pour laisser l'utilisateur démarrer manuellement
    }
  };
  return {
    remainingTime,
    isRunning,
    customTime,
    setCustomTime,
    handleStart,
    handlePause,
    handleSkip,
    handleReset,
    handleApplyCustomTime,
  };
};
