"use client";

import { Clock } from "lucide-react";
import { useSessionTimer } from "../../hooks";

/**
 * En-tête de la session d'exécution
 * Affiche : titre, timer, progression, bouton d'abandon

 */
interface SessionHeaderProps {
  sessionName: string;
  startedAt: string | null;
  completedCount: number;
  totalExercises: number;
  onCancel: () => void;
}

export default function SessionHeader({
  sessionName,
  startedAt,
  completedCount,
  totalExercises,
  onCancel,
}: SessionHeaderProps) {
  // ✅ Timer
  const { formattedTime, isMounted } = useSessionTimer(startedAt);

  // Calcul de la progression
  const progressPercentage = (completedCount / totalExercises) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Titre */}
      <h1 className="text-3xl font-bold text-primary-900 mb-2">
        {sessionName}
      </h1>

      {/* Timer et Progression */}
      <div className="flex justify-between items-center mb-4">
        {/* Timer - Se met à jour toutes les secondes */}
        <div className="flex items-center gap-2 text-lg">
          <Clock size={20} />
          <span>{isMounted ? formattedTime : "--:--:--"}</span>
        </div>

        {/* Exercices complétés */}
        <div className="text-sm text-gray-600">
          {completedCount} / {totalExercises} exercices
        </div>
      </div>

      {/* Bouton d'abandon */}
      <button
        onClick={onCancel}
        className="bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300 rounded p-2 text-xs my-1 cursor-pointer"
      >
        Abandonner
      </button>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
