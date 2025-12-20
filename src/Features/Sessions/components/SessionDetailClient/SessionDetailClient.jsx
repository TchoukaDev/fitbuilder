"use client";

// Page détaillée d'une séance terminée : affiche les exercices, stats, volume total, etc.
import { useRouter } from "next/navigation";
import { useDeleteSession } from "../../hooks";
import {
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  Trash2,
  Weight,
  Repeat2,
  ArrowLeft,
} from "lucide-react";
import { Button, DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { ExerciseDetailCard } from ".";
import { toast } from "react-toastify";
import StatusBadge from "@/Features/Calendar/components/StatusBadge";
import StatCard from "./StatCard";
import { useMemo } from "react";
import Link from "next/link";

export default function SessionDetailClient({ session, userId }) {
  const router = useRouter();

  // Modals
  const { isOpen, openModal, closeModal } = useModals();

  const { mutate: deleteSessionMutation, isPending: isDeleting } =
    useDeleteSession(userId);

  // ═══════════════════════════════════════════════════════
  // 📊 CALCULS
  // ═══════════════════════════════════════════════════════
  const completedExercises = useMemo(
    () => session?.exercises?.filter((ex) => ex.completed),
    [session?.exercises],
  );
  const totalSets = useMemo(
    () =>
      completedExercises?.reduce(
        (sum, ex) => sum + (ex.actualSets?.length || 0),
        0,
      ),
    [completedExercises],
  );
  const totalReps = useMemo(
    () =>
      completedExercises?.reduce(
        (sum, ex) =>
          sum +
          (ex.actualSets?.reduce((s, set) => s + (set.reps || 0), 0) || 0),
        0,
      ),
    [completedExercises],
  );
  const totalVolume = useMemo(
    () =>
      completedExercises?.reduce(
        (sum, ex) =>
          sum +
          (ex.actualSets?.reduce(
            (s, set) => s + (set.reps || 0) * (set.weight || 0),
            0,
          ) || 0),
        0,
      ),
    [completedExercises],
  );

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════
  const handleDelete = () => {
    deleteSessionMutation(session._id, {
      onSuccess: () => {
        toast.success("Session d'entraînement supprimée avec succès");
        closeModal("deleteConfirm");
        router.push("/sessions");
      },
      onError: () => {
        toast.error("Erreur lors de la suppression de la session");
      },
    });
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
      {/* ─────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Bouton retour */}
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2  text-primary-700 hover:text-primary-500 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Retour aux séances</span>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:-mb-4">
            <h1>{session.workoutName}</h1>
            {/* Badge terminé */}
            <div className="-mt-6 md:mt-0">
              <StatusBadge status={session.status} />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(session.completedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {session.duration}
            </span>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 justify-center md:justify-start items-center">
            {/* Actions */}
            <div className="flex gap-2 self-center">
              <Button
                width="w-12 md:w-auto"
                onClick={() => openModal("deleteConfirm")}
                close
                title="Supprimer"
                label="Supprimer la séance"
              >
                <Trash2 size={20} />{" "}
                <span className="hidden md:block">Supprimer la séance</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* STATS GLOBALES */}
        {/* ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Dumbbell size={24} />}
            label="Exercices"
            value={`${completedExercises?.length}/${session?.exercises?.length}`}
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Séries totales"
            value={totalSets}
          />
          <StatCard
            icon={<Repeat2 size={24} />}
            label="Répétitions"
            value={totalReps}
          />
          <StatCard
            icon={<Weight size={24} />}
            label="Volume total"
            value={`${Math.round(totalVolume)} kg`}
          />
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* EXERCICES */}
        {/* ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary-900">
            Détail des exercices
          </h2>

          {session?.exercises?.map((exercise, index) => (
            <ExerciseDetailCard key={exercise.exerciseId} exercise={exercise} />
          ))}
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* NOTES GLOBALES (si présentes) */}
        {/* ─────────────────────────────────────────────────── */}
        {session?.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              Notes de séance
            </h3>
            <p className="text-gray-700">{session.notes}</p>
          </div>
        )}

        {/* RESSENTI GLOBAL (si présent) */}
        {session?.effort && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-2">
              Ressenti global
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${session?.effort * 10}%` }}
                />
              </div>
              <span className="text-primary-900 font-bold">
                {session?.effort}/10
              </span>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────── */}
        {/* MODAL DE SUPPRESSION */}
        {/* ─────────────────────────────────────────────────── */}
        {isOpen("deleteConfirm") && (
          <DeleteConfirmModal
            title="Supprimer cette séance ?"
            message="Cette action est irréversible. Toutes les données de cette séance seront supprimées."
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        )}
      </div>
    </>
  );
}
