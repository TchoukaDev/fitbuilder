// components/Features/Sessions/SessionExecution/SessionExecution.jsx

"use client";

import { useCallback } from "react";
import { Clock } from "lucide-react";
import Button from "@/Global/components/ui/Button";
import SessionExerciseCard from "../SessionExerciseCard/SessionExerciseCard";
import FinishSessionModal from "@/Features/Sessions/modals/FinishSessionModal";
import CancelSessionModal from "@/Features/Sessions/modals/CancelModalSession";
import IncompleteExerciseModal from "@/Features/Sessions/modals/IncompleteExerciseModal";

// Hooks
import { useSessionTimer } from "@/Features/Sessions/hooks/useSessionTimer";
import { useAutoSave } from "@/Features/Sessions/hooks/useAutoSave";
import { useSessionBackup } from "@/Features/Sessions/hooks/useSessionBackUp";
import { useSessionState } from "../../hooks/useSessionState";
import { useSessionCompletion } from "../../hooks/useSessionCompletion";

// Functions
import { sessionExecutionHandlers } from "../../utils/sessionExecutionHandlers";
import { validateExercise } from "../../utils/validateExercise";
import { useModals } from "@/Providers/Modals/ModalContext";

export default function SessionExecution({ sessionData, sessionId, userId }) {
  // ═══════════════════════════════════════════════════════
  // 📊 STATE
  // ═══════════════════════════════════════════════════════
  const {
    exercises,
    setExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isSaving,
    setIsSaving,
    completedCount,
    totalExercises,
  } = useSessionState(sessionData);

  // ═══════════════════════════════════════════════════════
  // 🔧 HOOKS
  // ═══════════════════════════════════════════════════════

  // Modals
  const { isOpen, openModal, closeModal, getModalData } = useModals();

  // Timer
  const { formattedTime, isMounted } = useSessionTimer(sessionData?.startedAt);

  // LocalStorage
  const { clearBackup } = useSessionBackup(
    sessionId,
    exercises,
    setExercises,
    sessionData,
  );

  // Sauvegarder, terminer et annuler session
  const { saveProgress, finishSession, cancelSession } = useSessionCompletion(
    sessionId,
    userId,
    clearBackup,
    setIsSaving,
    formattedTime, // ✅ Passer formattedTime ici
  );

  // ✅ WRAPPER pour saveProgress (évite les appels directs)
  const handleSaveProgress = useCallback(() => {
    saveProgress(exercises);
  }, [exercises, saveProgress]);

  // ✅ Handlers
  const {
    handleSetChange,
    handleNotesChange,
    handleEffortChange,
    handleSetComplete,
    handleReopenExercise,
  } = sessionExecutionHandlers(
    exercises,
    setExercises,
    setCurrentExerciseIndex,
    handleSaveProgress, // ✅ Passer la fonction, pas l'appel
  );

  // Auto-save (30 secondes)
  useAutoSave(exercises, handleSaveProgress, 30000);

  // Validation pour terminer un exercice
  const handleExerciseComplete = (exerciseIndex) => {
    const validation = validateExercise(exercises, exerciseIndex);

    // Si validation échoue, ouvrir modale
    if (!validation.isComplete) {
      openModal("incompleteExercise", { validation, exerciseIndex });
    } else {
      completeExercise(exerciseIndex);
    }
  };

  // ✅ TERMINER L'EXERCICE (logique finale)
  const completeExercise = (exerciseIndex) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex ? { ...ex, completed: true } : ex,
      ),
    );

    closeModal("incompleteExercise");

    // Passer au suivant
    if (exerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }

    // Sauvegarder
    handleSaveProgress();
  };

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS POUR MODALS
  // ═══════════════════════════════════════════════════════

  const handleModalConfirm = () => {
    completeExercise(getModalData("incompleteExercise").exerciseIndex);
  };

  const handleModalCancel = () => {
    closeModal("incompleteExercise");
  };

  const handleFinishSession = () => {
    const hasCompletedExercises = exercises.some((ex) => ex.completed);

    if (!hasCompletedExercises) {
      openModal("cancelSession");
      return;
    }

    openModal("finishSession");
  };

  const handleConfirmFinish = () => {
    finishSession(exercises);
  };

  const handleConfirmCancel = () => {
    closeModal("cancelSession");
    cancelSession();
  };

  // ═══════════════════════════════════════════════════════
  // 🛡️ GUARD
  // ═══════════════════════════════════════════════════════
  if (!sessionData.exercises || sessionData.exercises.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-accent-100 border border-accent-400 text-accent-700 px-4 py-3 rounded">
          <p className="font-bold">Attention</p>
          <p>Cette session ne contient aucun exercice.</p>
          <Button onClick={() => router.push("/workouts")} className="mt-4">
            Retour aux entraînements
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            {sessionData.templateName}
          </h1>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-lg">
              <Clock size={20} />
              <span>{isMounted ? formattedTime : "--:--:--"}</span>
            </div>

            <div className="text-sm text-gray-600">
              {completedCount} / {totalExercises} exercices
            </div>
          </div>

          <button
            onClick={() => openModal("cancelSession")}
            className="bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300 rounded p-2 text-xs my-1 cursor-pointer"
          >
            Abandonner
          </button>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / totalExercises) * 100}%` }}
            />
          </div>
        </div>

        {/* LISTE DES EXERCICES */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <SessionExerciseCard
              key={exercise.exerciseId}
              exercise={exercise}
              index={index}
              isActive={index === currentExerciseIndex}
              onSetChange={handleSetChange}
              onNotesChange={handleNotesChange}
              onEffortChange={handleEffortChange}
              onSetComplete={handleSetComplete}
              onExerciseComplete={handleExerciseComplete}
              onReopenExercise={handleReopenExercise}
            />
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 left-0 right-0 bg-primary-100 border-t border-primary-800 p-4 shadow-lg">
        <div className="container mx-auto max-w-4xl flex justify-center gap-3">
          <Button
            onClick={handleSaveProgress}
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

      {/* MODALS */}
      {isOpen("incompleteExercise") && (
        <IncompleteExerciseModal
          missingFields={
            getModalData("incompleteExercise").validation.missingFields
          }
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {isOpen("finishSession") && (
        <FinishSessionModal
          onConfirm={handleConfirmFinish}
          sessionName={sessionData.templateName}
          completedCount={completedCount}
          totalExercises={totalExercises}
          duration={formattedTime}
          isLoading={isSaving}
        />
      )}

      {isOpen("cancelSession") && (
        <CancelSessionModal
          onConfirm={handleConfirmCancel}
          isLoading={isSaving}
        />
      )}
    </>
  );
}
