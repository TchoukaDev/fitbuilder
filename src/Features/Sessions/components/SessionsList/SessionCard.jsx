// Carte d'affichage d'une séance dans la liste (statut, exercices, durée, progression).
"use client";

import { Clock, Calendar, Dumbbell, CheckCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModals } from "@/Providers/Modals";

export default function SessionCard({ session, userId }) {
  const router = useRouter();
  const { openModal } = useModals();

  // ═══════════════════════════════════════════════════════
  // 🎨 HELPERS
  // ═══════════════════════════════════════════════════════
  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        bg: "bg-green-100",
        border: "border-green-300",
        text: "text-green-700",
        icon: <CheckCircle size={16} />,
        label: "Terminée",
      },
      "in-progress": {
        bg: "bg-accent-100",
        border: "border-accent-300",
        text: "text-accent-700",
        icon: <Play size={16} />,
        label: "En cours",
      },
      planned: {
        bg: "bg-primary-100",
        border: "border-primary-300",
        text: "text-primary-700",
        icon: <Calendar size={16} />,
        label: "Planifiée",
      },
    };
    return configs[status] || configs.planned;
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    if (typeof time === "string" && time.includes(":")) return time;
    return time;
  };

  const statusConfig = getStatusConfig(session.status);
  const completedExercises =
    session.exercises?.filter((ex) => ex.completed).length || 0;
  const totalExercises = session.exercises?.length || 0;

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════
  const handleClick = () => {
    if (session.status === "in-progress") {
      // Reprendre la séance en cours
      openModal("startOrContinueSession", {
        action: "continue",
        session: session,
      });
    } else if (session.status === "completed") {
      // ✅ Voir le détail de la séance terminée
      router.push(`/sessions/${session.id}/detail`);
    } else if (session.status === "planned") {
      // Démarrer la séance planifiée
      openModal("startOrContinueSession", {
        action: "start",
        session: session,
      });
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div
      onClick={handleClick}
      className={`bg-white border ${statusConfig.border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-primary-900">
            {session.workoutName}
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(
              session.completedDate ||
                session.scheduledDate ||
                session.startedAt ||
                session.createdAt,
            )}
          </p>
        </div>

        {/* Badge status */}
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium shrink-0 ${statusConfig.bg} ${statusConfig.text}`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        {/* Exercices complétés */}
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-primary-600" />
          <span className="text-gray-700">
            {completedExercises}/{totalExercises}
          </span>
        </div>

        {/* Durée (si complété) */}
        {session.duration && (
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary-600" />
            <span className="text-gray-700">
              {formatTime(session.duration)}
            </span>
          </div>
        )}

        {/* Date de création */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          <span className="text-gray-700">
            {new Date(session.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Barre de progression (si en cours ou complété) */}
      {(session.status === "completed" || session.status === "in-progress") && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                session.status === "completed"
                  ? "bg-green-600"
                  : "bg-primary-600"
              }`}
              style={{
                width: `${(completedExercises / totalExercises) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
