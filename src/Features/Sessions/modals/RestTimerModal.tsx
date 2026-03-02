"use client";

import { Play, Pause, SkipForward } from "lucide-react";
import { Button } from "@/Global/components";
import { createPortal } from "react-dom";
import { ModalLayout } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";
import { useRestTimer } from "../hooks/useRestTimer";

// Modal du timer

/**
 * Props du composant RestTimerModal
 * @param initialTime - Temps de repos en secondes (ex: 90)
 */

export default function RestTimerModal({
  initialTime
}: { initialTime: number }) {
  // ✅ Valeur par défaut si initialTime est undefined
  const safeInitialTime = initialTime || 90;

  const {
    remainingTime,
    setCustomTime,
    isRunning,
    customTime,
    handleStart,
    handlePause,
    handleSkip,
    handleReset,
    handleApplyCustomTime,
  } = useRestTimer(safeInitialTime);
  // ═══════════════════════════════════════════════════════
  // 🎨 FORMATAGE DU TEMPS (MM:SS)
  // ═══════════════════════════════════════════════════════
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 CALCUL DU POURCENTAGE (pour la barre de progression)
  // ═══════════════════════════════════════════════════════
  // ✅ Sûr : evite NaN/Infinity si customTime est 0 ou invalide
  const percentage =
    customTime > 0 ? ((customTime - remainingTime) / customTime) * 100 : 0;

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return createPortal(
    <ModalLayout title="⏱️ Temps de repos" modalToClose="restTimer">
      {/* ─────────────────────────────────────────────────── */}
      {/* BODY - AFFICHAGE DU TIMER */}
      {/* ─────────────────────────────────────────────────── */}


      <div className="space-y-4">
        {/* ⏰ Affichage du temps */}
        <div className="text-center py-2">
          <div
            className={`text-7xl font-bold tabular-nums tracking-tight transition-colors ${
              remainingTime <= 10 && remainingTime > 0
                ? "text-red-600 animate-pulse"
                : remainingTime === 0
                ? "text-green-600"
                : "text-primary-900"
            }`}
          >
            {formatTime(remainingTime)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {remainingTime === 0
              ? "✅ Repos terminé !"
              : isRunning
              ? "⏳ En cours..."
              : "⏸️ En pause"}
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Contrôles principaux — grille 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          {!isRunning ? (
            <Button full onClick={handleStart}>
              <Play size={20} />
              {remainingTime === customTime ? "Démarrer" : "Reprendre"}
            </Button>
          ) : (
            <Button full onClick={handlePause}>
              <Pause size={20} />
              Pause
            </Button>
          )}
          <Button
            full
            variant="close"
            onClick={handleSkip}
            className="bg-gray-600 hover:bg-gray-700"
          >
            <SkipForward size={20} />
            Passer
          </Button>
        </div>

        {/* Préréglages + réinitialiser */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-400 text-center mb-3">Changer la durée</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "1 min", value: 60 },
              { label: "1:30", value: 90 },
              { label: "2 min", value: 120 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleApplyCustomTime(value)}
                className="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
            >
              ↺
            </button>
          </div>

          {/* Durée personnalisée */}
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              inputMode="numeric"
              onKeyDown={handleKeyDown}
              min={10}
              placeholder="Secondes"
              value={customTime || ""}
              onChange={(e) => setCustomTime(parseInt(e.target.value) || 0)}
              className="input flex-1 p-2 pt-2"
            />
            <Button width="w-auto" onClick={() => handleApplyCustomTime(customTime)}>
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
