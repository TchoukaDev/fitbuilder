"use client";

// Page d'exécution d'une session : affiche les exercices, gère le timer, la validation et la sauvegarde.
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, LoaderButton } from "@/Global/components";
import { SessionExerciseCard } from "./SessionExerciseCard";

// Hooks
import {
  useAutoSave,
  useSessionBackup,
  useSessionState,
  useSessionCompletion,
} from "../../hooks";
import {
  validateExercise,
  completeExercise as completeExerciseAction,
} from "../../utils";
import { useModals } from "@/Providers/Modals";
import { useSessionStore } from "../../store";

// Components
import { SessionHeader } from "./index";

// Modals
import {
  FinishSessionModal,
  IncompleteExerciseModal,
  CancelSessionModal,
  RestTimerModal,
} from "../../modals";

export default function SessionExecution({ sessionData, sessionId, userId }) {
  // ═══════════════════════════════════════════════════════
  // 🔧 ROUTER
  // ═══════════════════════════════════════════════════════
  const router = useRouter();

  // ═══════════════════════════════════════════════════════
  // 📊 STATE (depuis le store Zustand)
  // ═══════════════════════════════════════════════════════
  const { exercises, currentExerciseIndex, completedCount, totalExercises } =
    useSessionState(sessionData);

  // Accès direct au store pour isSaving
  const isSaving = useSessionStore((state) => state.isSaving);

  // ═══════════════════════════════════════════════════════
  // 🔧 HOOKS
  // ═══════════════════════════════════════════════════════

  // Modals
  const { isOpen, openModal, closeModal, getModalData } = useModals();

  // ✅ Fonction pour calculer le temps formaté à la demande (sans state)
  const calculateFormattedTime = useCallback(() => {
    if (!sessionData?.startedAt) return "00:00:00";

    const startTime = new Date(sessionData.startedAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);

    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [sessionData?.startedAt]);

  // LocalStorage Backup
  const { clearBackup } = useSessionBackup(sessionId, sessionData);

  // Sauvegarder, terminer et annuler session
  const { saveProgress, finishSession, cancelSession } = useSessionCompletion(
    sessionId,
    userId,
    clearBackup,
    calculateFormattedTime,
  );

  // ✅ WRAPPER pour saveProgress
  const handleSaveProgress = useCallback(() => {
    saveProgress(exercises);
  }, [exercises, saveProgress]);

  // Auto-save (30 secondes)
  useAutoSave(exercises, handleSaveProgress, 30000);

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS POUR MODALS
  // ═══════════════════════════════════════════════════════

  // Confirmer la validation d'exercice incomplet ("Terminer quand même")
  const handleModalConfirm = () => {
    const exerciseIndex = getModalData("incompleteExercise").exerciseIndex;
    // ✅ Compléter directement l'exercice
    completeExerciseAction(exerciseIndex, handleSaveProgress);
    closeModal("incompleteExercise");
  };

  // Annuler la validation d'exercice incomplet
  const handleModalCancel = () => {
    closeModal("incompleteExercise");
  };

  // Demander la confirmation de la fin de séance
  const handleFinishSession = () => {
    const hasCompletedExercises = exercises?.some((ex) => ex.completed);

    if (!hasCompletedExercises) {
      openModal("cancelSession");
      return;
    }

    openModal("finishSession");
  };

  // Confirmer la fin de séance
  const handleConfirmFinish = () => {
    finishSession(exercises);
  };

  // Confirmer l'abandon de séance (suppression de la session)
  const handleConfirmCancel = () => {
    closeModal("cancelSession");
    cancelSession();
  };

  // ✅ Handler pour abandonner
  const handleCancelSession = useCallback(() => {
    openModal("cancelSession");
  }, [openModal]);

  // ✅ Fonction pour compléter un exercice (avec validation)
  const validateAndCompleteExercise = useCallback(
    (exerciseIndex) => {
      const validation = validateExercise(exercises, exerciseIndex);

      if (!validation.isComplete) {
        // ❌ Validation échouée - ouvrir modal avec détails
        openModal("incompleteExercise", { validation, exerciseIndex });
      } else {
        // ✅ Validation réussie - compléter l'exercice
        completeExerciseAction(exerciseIndex, handleSaveProgress);
      }
    },
    [exercises, openModal, handleSaveProgress],
  );

  // ✅ Plus de Context ! Les composants appelent directement le store

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
        <SessionHeader
          sessionName={sessionData.templateName}
          startedAt={sessionData?.startedAt}
          completedCount={completedCount}
          totalExercises={totalExercises}
          onCancel={handleCancelSession}
        />

        {/* LISTE DES EXERCICES */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <SessionExerciseCard
              key={exercise.exerciseId}
              exercise={exercise}
              index={index}
              isActive={index === currentExerciseIndex}
              onOpenRestTimer={openModal}
              onCompleteExercise={validateAndCompleteExercise}
            />
          ))}
        </div>

        {/* Modal du timer de repos */}
        {isOpen("restTimer") && (
          <RestTimerModal initialTime={getModalData("restTimer").restTime} />
        )}
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 left-0 right-0 bg-primary-100 border-t border-primary-800 p-4 shadow-lg">
        <div className="container mx-auto max-w-4xl flex justify-center gap-3">
          <LoaderButton
            isLoading={isSaving}
            loadingText="Sauvegarde en cours"
            type="button"
            onClick={handleSaveProgress}
            label="Sauvegarder"
          >
            💾 Sauvegarder
          </LoaderButton>

          <Button onClick={handleFinishSession} className="flex-1">
            Terminer la séance
          </Button>
        </div>
      </div>

      {/* Modal de validation d'exercice incomplet */}
      {isOpen("incompleteExercise") && (
        <IncompleteExerciseModal
          missingFields={
            getModalData("incompleteExercise").validation.missingFields
          }
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {/* Modal de validation de fin de séance */}
      {isOpen("finishSession") && (
        <FinishSessionModal
          onConfirm={handleConfirmFinish}
          sessionName={sessionData.templateName}
          completedCount={completedCount}
          totalExercises={totalExercises}
          duration={calculateFormattedTime()}
          isLoading={isSaving}
        />
      )}

      {/* Modal de validation d'abandon de séance */}
      {isOpen("cancelSession") && (
        <CancelSessionModal
          onConfirm={handleConfirmCancel}
          isLoading={isSaving}
        />
      )}
    </>
  );
}
