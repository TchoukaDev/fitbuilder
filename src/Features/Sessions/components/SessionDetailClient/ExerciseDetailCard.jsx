"use client";

// Carte détaillée d'un exercice terminé : toutes les séries, poids max, volume, RPE, notes.
import { Dumbbell, TrendingUp, Clock, MessageSquare } from "lucide-react";

export default function ExerciseDetailCard({ exercise }) {
  // ═══════════════════════════════════════════════════════
  // 📊 CALCULS
  // ═══════════════════════════════════════════════════════
  const totalReps = exercise.actualSets?.reduce(
    (sum, set) => sum + (set.reps || 0),
    0,
  );
  const totalVolume = exercise.actualSets?.reduce(
    (sum, set) => sum + (set.reps || 0) * (set.weight || 0),
    0,
  );
  const maxWeight = exercise.actualSets?.length
    ? Math.max(...exercise.actualSets.map((set) => set.weight || 0))
    : 0;

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 ${
        exercise.completed
          ? "border-green-300 bg-green-50/30"
          : "border-accent-300 bg-accent-50/30"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-900">
            {exercise.exerciseName}
          </h3>
          <div className="flex gap-3 text-sm text-gray-600 mt-1">
            <span className="flex items-center gap-1">
              <Dumbbell size={14} />
              {exercise.actualSets?.length || 0} séries
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} />
              {totalReps} reps
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} />
              {Math.round(totalVolume)} kg
            </span>
          </div>
        </div>

        {/* Badge complété */}
        {exercise.completed ? (
          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
            ✓ Terminé
          </span>
        ) : (
          <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
            Non terminé
          </span>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <p className="text-xs text-gray-600">Poids max</p>
          <p className="text-lg font-bold text-primary-900">{maxWeight} kg</p>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <p className="text-xs text-gray-600">Volume total</p>
          <p className="text-lg font-bold text-primary-900">
            {Math.round(totalVolume)} kg
          </p>
        </div>
        {exercise.effort && (
          <div className="bg-white rounded p-2 border border-gray-200 text-center">
            <p className="text-xs text-gray-600">RPE</p>
            <p className="text-lg font-bold text-primary-900">
              {exercise.effort}/10
            </p>
          </div>
        )}
      </div>

      {/* Tableau des séries */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Série
              </th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">
                Cible
              </th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">
                Réalisé
              </th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">
                Poids (kg)
              </th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {exercise.actualSets?.map((set, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 px-3 font-medium">Série {index + 1}</td>
                <td className="text-center py-2 px-3 text-gray-600">
                  {exercise.targetReps} reps
                </td>
                <td className="text-center py-2 px-3 font-semibold">
                  {set.reps} reps
                </td>
                <td className="text-center py-2 px-3 font-semibold">
                  {set.weight} kg
                </td>
                <td className="text-center py-2 px-3">
                  {set.completed ? (
                    <span className="text-green-600 font-semibold">✓</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes de l'exercice */}
      {exercise.notes && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-start gap-2">
            <MessageSquare size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Notes</p>
              <p className="text-sm text-blue-800">{exercise.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Temps de repos */}
      {exercise.restTime && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <Clock size={14} />
          Repos : {exercise.restTime}s
        </div>
      )}
    </div>
  );
}
