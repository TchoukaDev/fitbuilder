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


      <button
        onClick={() => {
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
            alert("Vibration déclenchée !");
          } else {
            alert("Vibration non supportée");
          }
        }}
      >
        🧪 Test Vibration
      </button>
      <div className="p-8 space-y-6">
        {/* ⏰ Grand affichage du temps */}
        <div className="text-center">
          <div
            className={`text-7xl font-bold transition-colors ${remainingTime <= 10 && remainingTime > 0
              ? "text-red-600 animate-pulse" // ⚠️ Alerte si moins de 10s
              : remainingTime === 0
                ? "text-green-600" // ✅ Vert si terminé
                : "text-primary-900"
              }`}
          >
            {formatTime(remainingTime)}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {remainingTime === 0
              ? "✅ Repos terminé !"
              : isRunning
                ? "⏳ En cours..."
                : "⏸️ En pause"}
          </p>
        </div>

        {/* 📊 Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* CONTRÔLES PRINCIPAUX */}
        {/* ─────────────────────────────────────────────────── */}
        <div className="flex justify-center gap-4">
          {/* Bouton Play/Pause */}
          {!isRunning ? (
            <Button onClick={handleStart} className="flex items-center gap-2">
              <Play size={20} />
              {remainingTime === customTime ? "Démarrer" : "Reprendre"}
            </Button>
          ) : (
            <Button onClick={handlePause} className="flex items-center gap-2">
              <Pause size={20} />
              Pause
            </Button>
          )}

          {/* Bouton Skip */}
          <Button
            close
            onClick={handleSkip}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
          >
            <SkipForward size={20} />
            Passer
          </Button>
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* MODIFICATION DU TEMPS */}
        {/* ─────────────────────────────────────────────────── */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Modifier le temps de repos (secondes) :
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              onKeyDown={handleKeyDown}
              min={10}
              value={customTime || ""}
              onChange={(e) => setCustomTime(parseInt(e.target.value) || 0)}
              className="input flex-1 p-2"
            />
            <Button onClick={() => handleApplyCustomTime(customTime)}>Appliquer</Button>
          </div>

          {/* Boutons rapides */}
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={() => {
                handleApplyCustomTime(60);
              }}
              className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              1 min
            </button>
            <button
              onClick={() => {
                handleApplyCustomTime(90);
              }}
              className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              1:30
            </button>
            <button
              onClick={() => {
                handleApplyCustomTime(120);
              }}
              className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              2 min
            </button>
            <button
              onClick={handleReset}
              className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </ModalLayout>,
    document.getElementById("portal-root") as HTMLDivElement,
  );
}
