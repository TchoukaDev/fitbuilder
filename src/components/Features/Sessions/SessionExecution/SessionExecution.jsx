"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, Circle } from "lucide-react";
import Button from "@/components/Buttons/Button";

export default function SessionExecution({ sessionData, userId }) {
  const router = useRouter();

  // ═══════════════════════════════════════════════════════
  // 📊 STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════
  const [exercises, setExercises] = useState(sessionData.exercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Secondes écoulées
  const [isSaving, setIsSaving] = useState(false);

  // ═══════════════════════════════════════════════════════
  // ⏱️ CHRONOMÈTRE GLOBAL
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const startTime = new Date(sessionData.startedAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData.startedAt]);

  // ═══════════════════════════════════════════════════════
  // 🔢 CALCULS & HELPERS
  // ═══════════════════════════════════════════════════════
  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalExercises = exercises.length;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════

  // Ajouter/modifier une série
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];

    // Si la série n'existe pas encore, la créer
    if (!newExercises[exerciseIndex].actualSets[setIndex]) {
      newExercises[exerciseIndex].actualSets[setIndex] = {
        reps: null,
        weight: newExercises[exerciseIndex].targetWeight || null,
        completed: false,
      };
    }

    newExercises[exerciseIndex].actualSets[setIndex][field] = value;
    setExercises(newExercises);
  };

  // Valider une série (checkbox)
  const handleSetComplete = (exerciseIndex, setIndex) => {
    handleSetChange(exerciseIndex, setIndex, "completed", true);
  };

  // Marquer un exercice comme terminé
  const handleExerciseComplete = async (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].completed = true;
    setExercises(newExercises);

    // Sauvegarder en DB
    await saveProgress(newExercises);

    // Passer à l'exercice suivant
    if (exerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  };

  // Sauvegarder la progression
  const saveProgress = async (updatedExercises) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises: updatedExercises }),
      });

      if (!response.ok) throw new Error("Erreur sauvegarde");
    } catch (error) {
      console.error(error);
      // toast.error si tu veux
    } finally {
      setIsSaving(false);
    }
  };

  // Terminer la séance
  const handleFinishSession = () => {
    // Ouvrir une modale de confirmation avec notes/feeling
    // Puis appeler PUT /api/sessions/[id]
    // Puis rediriger
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* ─────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          {sessionData.templateName}
        </h1>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-lg">
            <Clock size={20} />
            <span>{formatTime(elapsedTime)}</span>
          </div>

          <div className="text-sm text-gray-600">
            {completedCount} / {totalExercises} exercices
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* LISTE DES EXERCICES */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise._id}
            exercise={exercise}
            index={index}
            isActive={index === currentExerciseIndex}
            onSetChange={handleSetChange}
            onSetComplete={handleSetComplete}
            onExerciseComplete={handleExerciseComplete}
          />
        ))}
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* FOOTER ACTIONS */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="container mx-auto max-w-4xl flex gap-3">
          <Button
            onClick={() => saveProgress(exercises)}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? "Sauvegarde..." : "💾 Sauvegarder"}
          </Button>

          <Button onClick={handleFinishSession} className="flex-1">
            🏁 Terminer la séance
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 🧩 SOUS-COMPOSANT : ExerciseCard
// ═══════════════════════════════════════════════════════
function ExerciseCard({
  exercise,
  index,
  isActive,
  onSetChange,
  onSetComplete,
  onExerciseComplete,
}) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  return (
    <div
      className={`
      border rounded-lg p-4 transition-all
      ${isActive ? "border-primary-500 bg-primary-50" : "border-gray-300"}
      ${exercise.completed ? "opacity-60" : ""}
    `}
    >
      {/* Header de l'exercice */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {exercise.completed ? (
            <CheckCircle className="text-green-600" size={24} />
          ) : (
            <Circle className="text-gray-400" size={24} />
          )}

          <div>
            <h3 className="font-semibold text-lg">{exercise.exerciseName}</h3>
            <p className="text-sm text-gray-600">
              {exercise.targetSets} × {exercise.targetReps}
              {exercise.targetWeight && ` @ ${exercise.targetWeight}kg`}
            </p>
          </div>
        </div>

        <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
      </div>

      {/* Détail des séries (déplié) */}
      {isExpanded && !exercise.completed && (
        <div className="mt-4 space-y-3">
          {/* Afficher les séries (à implémenter) */}
          {Array.from({ length: exercise.targetSets }).map((_, setIndex) => (
            <SetRow
              key={setIndex}
              setIndex={setIndex}
              setData={exercise.actualSets[setIndex]}
              targetWeight={exercise.targetWeight}
              onSetChange={(field, value) =>
                onSetChange(index, setIndex, field, value)
              }
              onSetComplete={() => onSetComplete(index, setIndex)}
            />
          ))}

          <Button
            onClick={() => onExerciseComplete(index)}
            className="w-full mt-4"
          >
            Exercice terminé
          </Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 🧩 SOUS-COMPOSANT : SetRow (une série)
// ═══════════════════════════════════════════════════════
function SetRow({
  setIndex,
  setData,
  targetWeight,
  onSetChange,
  onSetComplete,
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded border">
      <span className="font-semibold w-8">#{setIndex + 1}</span>

      <input
        type="number"
        placeholder="Poids"
        value={setData?.weight || targetWeight || ""}
        onChange={(e) => onSetChange("weight", parseFloat(e.target.value))}
        className="input w-20"
      />
      <span>kg</span>

      <span>×</span>

      <input
        type="number"
        placeholder="Reps"
        value={setData?.reps || ""}
        onChange={(e) => onSetChange("reps", parseInt(e.target.value))}
        className="input w-16"
      />
      <span>reps</span>

      <input
        type="checkbox"
        checked={setData?.completed || false}
        onChange={() => onSetComplete()}
        className="w-5 h-5"
      />
    </div>
  );
}
