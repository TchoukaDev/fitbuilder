"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import Button from "@/components/Buttons/Button";
import SessionExerciseCard from "../SessionExerciseCard/SessionExerciseCard";
import { toast } from "react-toastify";
import FinishSessionModal from "@/components/Modals/FinishSessionModal/FinishSessionModal";
import CancelSessionModal from "@/components/Modals/CancelModalSession/CancelModalSession";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSessionHandlers } from "@/hooks/useSessionHandlers";
import { useSessionBackup } from "@/hooks/useSessionBackUp";

export default function SessionExecution({ sessionData, sessionId }) {
  const router = useRouter();

  // ═══════════════════════════════════════════════════════
  // 📊 STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════
  const [exercises, setExercises] = useState(sessionData.exercises); //Exercises de la session
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0); //Exercice en cours d'exécution

  const [isSaving, setIsSaving] = useState(false); //Etat de sauvegarde de la session
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false); //Gestion de la modale de fin
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); //Gestion de la modale d'annulation
  const completedCount = exercises.filter((ex) => ex.completed).length; //Nombre d'exercices complétés
  const totalExercises = exercises.length;

  //Sécurité Vérifier que exercises existe
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

  // Sauvegarder la progression
  const saveProgress = async (updatedExercises) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: updatedExercises,
          duration: formattedTime,
        }),
      });
      clearBackup();
      if (!response.ok) throw new Error("Erreur sauvegarde");
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // HOOKS
  const {
    handleSetChange,
    handleNotesChange,
    handleEffortChange,
    handleSetComplete,
    handleReopenExercise,
    handleExerciseComplete,
  } = useSessionHandlers(
    exercises,
    setExercises,
    setCurrentExerciseIndex,
    saveProgress,
  );

  //gestion du Timer
  const { elapsedTime, formattedTime, isMounted } = useSessionTimer(
    sessionData?.startedAt,
  );

  //Auto-save (30 secondes)
  useAutoSave(exercises, saveProgress, 1000 * 30);

  // LocalStorage
  const { clearBackup } = useSessionBackup(
    sessionId,
    exercises,
    setExercises,
    sessionData,
  );

  // Terminer la séance (ouvrir la modale et vérifier)
  const handleFinishSession = async () => {
    const hasCompletedExercises = exercises.some((ex) => ex.completed);

    if (!hasCompletedExercises) {
      // Aucun exercice complété → Proposer d'annuler
      setIsCancelModalOpen(true);
      return;
    }

    setIsFinishModalOpen(true);
  };

  // Confirmer la fin
  const handleConfirmFinish = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: exercises,
          duration: formattedTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      // ✅ NETTOYER LE BACKUP après succès
      clearBackup();

      toast.success("🎉 Séance terminée avec succès !");
      router.push("/dashboard"); // ou "/sessions"
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la finalisation");
      setIsSaving(false);
    }
  };

  // Annuler et supprimer la séance
  const deleteSession = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sessions/${sessionData._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // ✅ NETTOYER LE BACKUP après suppression
      clearBackup();
      toast.success("Séance annulée");
      router.push("/workouts"); // Retour aux workouts
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation");
      setIsSaving(false);
    }
  };

  // Confirmer l'annulation
  const handleConfirmCancel = async () => {
    setIsCancelModalOpen(false);
    await deleteSession();
  };
  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
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
              <Clock size={20} />{" "}
              {sessionData && sessionData.startedAt && isMounted ? (
                <span>{formattedTime}</span>
              ) : (
                <span>--:--:--</span>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {completedCount} / {totalExercises} exercices
            </div>
          </div>
          <button
            onClick={() => setIsCancelModalOpen(true)}
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

        {/* ─────────────────────────────────────────────────── */}
        {/* LISTE DES EXERCICES */}
        {/* ─────────────────────────────────────────────────── */}
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

        {/* ─────────────────────────────────────────────────── */}
        {/* FOOTER ACTIONS */}
        {/* ─────────────────────────────────────────────────── */}
      </div>{" "}
      <div className="sticky bottom-0 left-0 right-0 bg-primary-100 border-t border-primary-800 p-4 shadow-lg">
        <div className="container mx-auto max-w-4xl flex justify-center gap-3">
          <Button
            onClick={() => saveProgress(exercises)}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? "Sauvegarde..." : "💾 Sauvegarder la progression"}
          </Button>

          <Button onClick={handleFinishSession} className="flex-1">
            🏁 Terminer la séance
          </Button>
        </div>
      </div>
      {/* Modale de fin */}
      {isFinishModalOpen && (
        <FinishSessionModal
          isOpen={isFinishModalOpen}
          onClose={() => setIsFinishModalOpen(false)}
          onConfirm={handleConfirmFinish}
          sessionName={sessionData.templateName}
          completedCount={completedCount}
          totalExercises={totalExercises}
          duration={formattedTime}
          isLoading={isSaving}
        />
      )}
      {/* Modale d'annulation */}
      {isCancelModalOpen && (
        <CancelSessionModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          isLoading={isSaving}
        />
      )}
    </>
  );
}
