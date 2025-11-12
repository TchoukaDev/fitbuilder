"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import Button from "@/components/Buttons/Button";
import SessionExerciseCard from "../SessionExerciseCard/SessionExerciseCard";
import { toast } from "react-toastify";
import FinishSessionModal from "@/components/Modals/FinishSessionModal/FinishSessionModal";
import CancelSessionModal from "@/components/Modals/CancelModalSession/CancelModalSession";

export default function SessionExecution({ sessionData, sessionId }) {
  const router = useRouter();

  // ═══════════════════════════════════════════════════════
  // 📊 STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════
  const [exercises, setExercises] = useState(sessionData.exercises); //Exercises de la session
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0); //Exercice en cours d'exécution
  const [elapsedTime, setElapsedTime] = useState(0); // Secondes écoulées
  const [isSaving, setIsSaving] = useState(false); //Etat de sauvegarde de la session
  const [isMounted, setIsMounted] = useState(false); // Pour le placeholder du chronomètre
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false); //Gestion de la modale de fin
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); //Gestion de la modale d'annulation
  const completedCount = exercises.filter((ex) => ex.completed).length; //Nombre d'exercices complétés
  const totalExercises = exercises.length;

  //Sécurité Vérifier que exercises existe
  if (!sessionData.exercises || sessionData.exercises.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
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
  // ⏱️ CHRONOMÈTRE GLOBAL
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!sessionData?.startedAt) return;

    // Calculer temps de départ (millisecondes)

    const startTime = new Date(sessionData.startedAt).getTime();

    // Interval de 1 seconde
    const interval = setInterval(() => {
      //  Récupérer l'heure actuelle en millisecondes

      const now = Date.now();

      // ➗ Calculer le temps écoulé (secondes)

      const elapsed = Math.floor((now - startTime) / 1000);

      if (!isNaN(elapsed) && elapsed >= 0) {
        setElapsedTime(elapsed);
        setIsMounted(true);
      }
    }, 1000);

    // Calculer immédiatement pour le début
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    if (!isNaN(elapsed) && elapsed >= 0) {
      setElapsedTime(elapsed);
      setIsMounted(true); // ✅
    }

    // CLEANUP
    return () => clearInterval(interval);
  }, [sessionData.startedAt]);

  const formatTime = (seconds) => {
    // Calculer les heures
    const h = Math.floor(seconds / 3600);

    //  Calculer minutes
    const m = Math.floor((seconds % 3600) / 60);

    // Calculer secondes
    const s = seconds % 60;

    //  Formatter
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

  // Modifier les notes d'un exercice
  const handleNotesChange = (exerciseIndex, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].notes = value;
    setExercises(newExercises);
  };

  // Modifier l'effort (RPE) d'un exercice
  const handleEffortChange = (exerciseIndex, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].effort = value;
    setExercises(newExercises);
  };

  // Valider/Dévalider une série (checkbox toggle)
  const handleSetComplete = (exerciseIndex, setIndex) => {
    const currentValue =
      exercises[exerciseIndex].actualSets?.[setIndex]?.completed || false;
    handleSetChange(exerciseIndex, setIndex, "completed", !currentValue); // ✅ Inverse
  };
  // Réouvrir un exercice complété (si erreur)
  const handleReopenExercise = (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].completed = false;
    setExercises(newExercises);

    // Revenir à cet exercice
    setCurrentExerciseIndex(exerciseIndex);
  };

  // Marquer un exercice comme terminé
  const handleExerciseComplete = async (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].completed = true;
    setExercises(newExercises);

    // Sauvegarder en DB
    await saveProgress(exercises);

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
      toast.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  //
  // Auto-save (après 30 secondes sans modification)
  //
  useEffect(() => {
    if (!exercises || exercises.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveProgress(exercises);
    }, 1000 * 30);

    return () => clearTimeout(timeoutId);
  }, [exercises]);

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
      if (sessionId) {
        localStorage.removeItem(`session-backup-${sessionId}`);
        console.log("🗑️ Backup local supprimé (session annulée)");
      }
      toast.success("Séance annulée");
      router.push("/workouts"); // Retour aux workouts
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation");
      setIsSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 💾 BACKUP LOCAL : Sauvegarder dans localStorage
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    // Vérifier que les données existent
    if (!exercises || exercises.length === 0 || !sessionId) {
      return;
    }

    try {
      // Créer l'objet à sauvegarder
      const backupData = {
        exercises: exercises,
        timestamp: Date.now(), // Pour savoir quand le backup a été fait
      };

      // Sauvegarder dans localStorage
      localStorage.setItem(
        `session-backup-${sessionId}`, // ✅ Clé unique par session
        JSON.stringify(backupData),
      );
    } catch (error) {
      console.warn("⚠️ Impossible de sauvegarder en localStorage:", error);
    }
  }, [exercises, sessionId]);

  // ═══════════════════════════════════════════════════════
  // 🔄 RESTAURATION : Récupérer le backup au montage
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    // Vérifier que sessionId existe
    if (!sessionId) return;

    try {
      // Récupérer le backup depuis localStorage
      const backupString = localStorage.getItem(`session-backup-${sessionId}`);

      // Si pas de backup, ne rien faire
      if (!backupString) {
        return;
      }

      // Parser le backup
      const backupData = JSON.parse(backupString);
      const { exercises: backupExercises, timestamp } = backupData;

      // Créer des dates pour comparer
      const backupDate = new Date(timestamp);
      const serverDate = new Date(
        sessionData?.updatedAt || sessionData?.createdAt,
      );

      // ✅ Vérifier si le backup est plus récent que les données serveur
      if (backupDate > serverDate) {
        setExercises(backupExercises);
      } else {
        // Le backup est plus ancien, le supprimer
        localStorage.removeItem(`session-backup-${sessionId}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la lecture du backup:", error);
    }
  }, [sessionId]);

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

  // Confirmer l'annulation
  const handleConfirmCancel = async () => {
    setIsCancelModalOpen(false);
    await deleteSession();
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
          duration: formatTime(elapsedTime),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      // ✅ NETTOYER LE BACKUP après succès
      if (sessionId) {
        localStorage.removeItem(`session-backup-${sessionId}`);
      }

      toast.success("🎉 Séance terminée avec succès !");
      router.push("/dashboard"); // ou "/sessions"
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la finalisation");
      setIsSaving(false);
    }
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
                <span>{formatTime(elapsedTime)}</span>
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
          duration={formatTime(elapsedTime)}
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
