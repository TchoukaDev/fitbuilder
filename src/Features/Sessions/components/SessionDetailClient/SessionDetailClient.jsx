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
  ChevronLeft,
} from "lucide-react";
import { DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { ExerciseDetailCard } from ".";

export default function SessionDetailClient({ session, userId }) {
  const router = useRouter();

  // Modals
  const { isOpen, openModal } = useModals();

  const { mutate: deleteSessionMutation } = useDeleteSession(userId);

  // ═══════════════════════════════════════════════════════
  // 📊 CALCULS
  // ═══════════════════════════════════════════════════════
  const completedExercises = session.exercises.filter((ex) => ex.completed);
  const totalSets = completedExercises.reduce(
    (sum, ex) => sum + (ex.actualSets?.length || 0),
    0,
  );
  const totalReps = completedExercises.reduce(
    (sum, ex) =>
      sum + (ex.actualSets?.reduce((s, set) => s + (set.reps || 0), 0) || 0),
    0,
  );
  const totalVolume = completedExercises.reduce(
    (sum, ex) =>
      sum +
      (ex.actualSets?.reduce(
        (s, set) => s + (set.reps || 0) * (set.weight || 0),
        0,
      ) || 0),
    0,
  );

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════
  const handleDelete = () => {
    deleteSessionMutation(session._id, {
      onSuccess: () => {
        router.push("/sessions");
      },
    });
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* ─────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/sessions")}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition"
        >
          <ChevronLeft size={20} />
          Retour à l'historique
        </button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              {session.templateName}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
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
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => openModal("deleteConfirm")}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Badge terminé */}
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          ✓ Séance terminée
        </span>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* STATS GLOBALES */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Dumbbell size={24} />}
          label="Exercices"
          value={`${completedExercises.length}/${session.exercises.length}`}
          color="primary"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Séries totales"
          value={totalSets}
          color="accent"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Répétitions"
          value={totalReps}
          color="green"
        />
        <StatCard
          icon={<Dumbbell size={24} />}
          label="Volume total"
          value={`${Math.round(totalVolume)} kg`}
          color="primary"
        />
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* EXERCICES */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary-900">
          Détail des exercices
        </h2>

        {session.exercises.map((exercise, index) => (
          <ExerciseDetailCard key={exercise.exerciseId} exercise={exercise} />
        ))}
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* NOTES GLOBALES (si présentes) */}
      {/* ─────────────────────────────────────────────────── */}
      {session.overallNotes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Notes de séance</h3>
          <p className="text-gray-700">{session.overallNotes}</p>
        </div>
      )}

      {/* RESSENTI GLOBAL (si présent) */}
      {session.overallFeeling && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-2">
            Ressenti global
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${session.overallFeeling * 10}%` }}
              />
            </div>
            <span className="text-primary-900 font-bold">
              {session.overallFeeling}/10
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
          isLoading={deleteSessionMutation.isPending}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 COMPOSANT STAT CARD
// ═══════════════════════════════════════════════════════
function StatCard({ icon, label, value, color = "primary" }) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600 border-primary-300",
    accent: "bg-accent-100 text-accent-600 border-accent-300",
    green: "bg-green-100 text-green-600 border-green-300",
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-4 flex flex-col items-center text-center`}
    >
      <div className="mb-2">{icon}</div>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
