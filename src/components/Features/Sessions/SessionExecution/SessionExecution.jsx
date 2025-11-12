"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import Button from "@/components/Buttons/Button";
import SessionExerciseCard from "../SessionExerciseCard/SessionExerciseCard";
import { useGetSessionById } from "@/hooks/useSessions";
import { toast } from "react-toastify";
import FinishSessionModal from "@/components/Modals/FinishSessionModal/FinishSessionModal";
import CancelSessionModal from "@/components/Modals/CancelModalSession/CancelModalSession";

export default function SessionExecution({ initialSessionData, userId }) {
  const router = useRouter();

  const { data: sessionData = [] } = useGetSessionById(
    initialSessionData,
    initialSessionData._id,
  );

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

  // ═══════════════════════════════════════════════════════
  // ⏱️ CHRONOMÈTRE GLOBAL
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!sessionData?.startedAt) return;
    // ═══════════════════════════════════════════════════════
    // 📅 1. CALCULER LE TEMPS DE DÉPART
    // ═══════════════════════════════════════════════════════
    const startTime = new Date(sessionData.startedAt).getTime();
    // sessionData.startedAt = "2024-01-15T10:30:00.000Z" (string ISO)
    // new Date(...) = Convertit en objet Date
    // .getTime() = Convertit en timestamp (millisecondes depuis 1970)
    // Exemple : 1705318200000

    // ═══════════════════════════════════════════════════════
    // ⏲️ 2. CRÉER UN INTERVAL (s'exécute toutes les 1000ms = 1s)
    // ═══════════════════════════════════════════════════════
    const interval = setInterval(() => {
      // Cette fonction s'exécute CHAQUE SECONDE

      // ───────────────────────────────────────────────────
      // 🕐 Récupérer l'heure actuelle en millisecondes
      // ───────────────────────────────────────────────────
      const now = Date.now();
      // Exemple : 1705320000000 (15 minutes après startTime)

      // ───────────────────────────────────────────────────
      // ➗ Calculer le temps écoulé
      // ───────────────────────────────────────────────────
      const elapsed = Math.floor((now - startTime) / 1000);
      // now - startTime = 1800000 millisecondes (30 min)
      // / 1000 = 1800 secondes
      // Math.floor() = Arrondir à l'entier inférieur (1800.5 → 1800)

      // ───────────────────────────────────────────────────
      // 💾 Mettre à jour le state (déclenche un re-render)
      // ───────────────────────────────────────────────────
      if (!isNaN(elapsed) && elapsed >= 0) {
        setElapsedTime(elapsed);
        setIsMounted(true); // ✅ Marquer comme monté après le 1er calcul
      }
      // elapsedTime passe de 0 → 1 → 2 → 3... chaque seconde
    }, 1000); // ← Exécuter toutes les 1000ms (1 seconde)

    // Calculer immédiatement (pas attendre 1 seconde)
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    if (!isNaN(elapsed) && elapsed >= 0) {
      setElapsedTime(elapsed);
      setIsMounted(true); // ✅
    }

    // ═══════════════════════════════════════════════════════
    // 🧹 3. CLEANUP FUNCTION (nettoyage)
    // ═══════════════════════════════════════════════════════
    return () => clearInterval(interval);
    // Pourquoi ? Si le composant se démonte (changement de page),
    // il faut ARRÊTER l'interval sinon il continue à tourner
    // en arrière-plan et cause des fuites mémoire + erreurs
  }, [sessionData.startedAt]);
  // ↑ Dépendances : Re-exécuter ce useEffect SI startedAt change
  //    (normalement il ne change jamais, donc useEffect s'exécute
  //     seulement au montage du composant)

  // ═══════════════════════════════════════════════════════
  // 🔢 CALCULS & HELPERS
  // ═══════════════════════════════════════════════════════

  const formatTime = (seconds) => {
    // ═══════════════════════════════════════════════════════
    // 🕐 CALCULER LES HEURES
    // ═══════════════════════════════════════════════════════
    const h = Math.floor(seconds / 3600);
    // 3600 secondes = 1 heure
    // Exemple : 7265 secondes / 3600 = 2.01
    // Math.floor(2.01) = 2 heures

    // ═══════════════════════════════════════════════════════
    // 🕑 CALCULER LES MINUTES (du reste)
    // ═══════════════════════════════════════════════════════
    const m = Math.floor((seconds % 3600) / 60);
    // seconds % 3600 = reste après avoir retiré les heures
    // 7265 % 3600 = 65 secondes restantes
    // 65 / 60 = 1.08
    // Math.floor(1.08) = 1 minute

    // ═══════════════════════════════════════════════════════
    // 🕒 CALCULER LES SECONDES (du reste)
    // ═══════════════════════════════════════════════════════
    const s = seconds % 60;
    // 7265 % 60 = 5 secondes

    // ═══════════════════════════════════════════════════════
    // 🎨 FORMATER EN STRING (avec zéros devant si besoin)
    // ═══════════════════════════════════════════════════════
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    // ───────────────────────────────────────────────────────
    // .toString() = Convertir nombre en string
    // ───────────────────────────────────────────────────────
    // h = 2 → "2"
    // m = 1 → "1"
    // s = 5 → "5"

    // ───────────────────────────────────────────────────────
    // .padStart(2, "0") = Ajouter des "0" devant si < 2 caractères
    // ───────────────────────────────────────────────────────
    // "2".padStart(2, "0") → "02"
    // "1".padStart(2, "0") → "01"
    // "5".padStart(2, "0") → "05"
    // "12".padStart(2, "0") → "12" (déjà 2 caractères, rien à faire)

    // ───────────────────────────────────────────────────────
    // Résultat final :
    // ───────────────────────────────────────────────────────
    // → "02:01:05"
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

      toast.success("Séance annulée");
      router.push("/workouts"); // Retour aux workouts
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation");
      setIsSaving(false);
    }
  };

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
