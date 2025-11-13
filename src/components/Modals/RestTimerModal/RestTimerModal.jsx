"use client";

import { X, Play, Pause, SkipForward } from "lucide-react";
import { useState, useEffect } from "react";
import Button from "@/components/Buttons/Button";
import { useTimerEffects } from "@/hooks/useTimerEffects";
import { useBlockScroll } from "@/hooks/useBlockScroll";

export default function RestTimerModal({
  onClose,
  initialTime, // Temps de repos en secondes (ex: 90)
}) {
  // ═══════════════════════════════════════════════════════
  // 📊 STATES
  // ═══════════════════════════════════════════════════════
  // Temps restant en secondes
  const [remainingTime, setRemainingTime] = useState(initialTime);

  // Timer en cours ou en pause
  const [isRunning, setIsRunning] = useState(false);

  // Temps personnalisé (pour modification manuelle)
  const [customTime, setCustomTime] = useState(initialTime);

  // Hook pour effets de fin de Timer
  const { triggerTimerComplete } = useTimerEffects();

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
    onClose(); // Fermer la modale
  };

  // Réinitialiser avec le temps initial
  const handleReset = () => {
    setIsRunning(false);
    setRemainingTime(initialTime);
    setCustomTime(initialTime);
  };

  // Appliquer un temps personnalisé
  const handleApplyCustomTime = (option) => {
    let newTime = customTime;

    if (isNaN(option)) {
      newTime = parseInt(customTime);
    } else {
      newTime = option;
      setCustomTime(newTime);
    }
    if (newTime > 0) {
      setRemainingTime(newTime);
      setIsRunning(false); // Arrêter le timer pour laisser l'utilisateur démarrer manuellement
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 FORMATAGE DU TEMPS (MM:SS)
  // ═══════════════════════════════════════════════════════
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 CALCUL DU POURCENTAGE (pour la barre de progression)
  // ═══════════════════════════════════════════════════════
  const percentage = ((customTime - remainingTime) / customTime) * 100;

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full relative">
        {/* ─────────────────────────────────────────────────── */}
        {/* BOUTON FERMER */}
        {/* ─────────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 hover:text-accent-600 cursor-pointer transition-all"
        >
          <X size={24} />
        </button>

        {/* ─────────────────────────────────────────────────── */}
        {/* HEADER */}
        {/* ─────────────────────────────────────────────────── */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-primary-900 text-center">
            ⏱️ Temps de repos
          </h2>
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* BODY - AFFICHAGE DU TIMER */}
        {/* ─────────────────────────────────────────────────── */}
        <div className="p-8 space-y-6">
          {/* ⏰ Grand affichage du temps */}
          <div className="text-center">
            <div
              className={`text-7xl font-bold transition-colors ${
                remainingTime <= 10 && remainingTime > 0
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
                min={10}
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="input flex-1 p-2"
              />
              <Button onClick={handleApplyCustomTime}>Appliquer</Button>
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
      </div>
    </div>
  );
}
