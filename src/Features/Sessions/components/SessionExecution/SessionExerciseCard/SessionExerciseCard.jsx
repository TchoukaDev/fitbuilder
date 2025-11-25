"use client";

import { CheckCircle, Circle, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { SetRow } from ".";
import { Button } from "@/Global/components";
import { AnimatePresence, motion } from "framer-motion";
import { RestTimerModal } from "@/Features/Sessions/modals";
import { useModals } from "@/Providers/Modals";

// Carte d'un exercice pendant l'exécution de la session
export default function SessionExerciseCard({
  exercise,
  index,
  isActive,
  onSetChange,
  onNotesChange,
  onEffortChange,
  onSetComplete,
  onExerciseComplete,
  onReopenExercise,
}) {
  const [isExpanded, setIsExpanded] = useState(isActive); //Pour ouvrir/fermer le formulaire des séries
  const [localEffort, setLocalEffort] = useState(exercise.effort ?? null);

  const { openModal, isOpen } = useModals();

  const handleEffortChange = (value) => {
    // Validation : entre 1 et 10, ou null si vide
    const numValue = value === "" ? null : parseInt(value);

    if (numValue === null || (numValue >= 1 && numValue <= 10)) {
      setLocalEffort(numValue);
      onEffortChange(index, numValue);
    }
  };

  // Synchronisation de l'input RPE avec exerciseEffort si existant
  useEffect(() => {
    setLocalEffort(exercise.effort ?? null);
  }, [exercise.effort]);

  // Ouvrir le détail de l'exercice actif
  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  /*------------------
  RENDER
 ------------------- */

  return (
    <>
      <div
        className={`
      border rounded-lg p-4 transition-all
      ${isActive ? "border-primary-500 bg-primary-50" : "border-gray-300"}
    
    `}
      >
        {/* Header de l'exercice */}
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <div
            className={`flex items-center gap-3   ${
              exercise.completed ? "opacity-60" : ""
            }`}
          >
            {exercise.completed ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <Circle className="text-gray-400" size={24} />
            )}

            <div>
              <h3 className="font-semibold text-lg">{exercise.exerciseName}</h3>
              <p className="text-sm text-gray-600">
                {exercise.targetSets} × {exercise.targetReps}
                {exercise.targetWeight && ` - ${exercise.targetWeight}kg`}
              </p>

              {/* Badges de statut */}
              <div className="flex items-center gap-2 mt-1">
                {exercise.completed ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                    ✅ Terminé
                  </span>
                ) : isActive ? (
                  <span className="text-xs bg-accent-100 text-accent-500 px-2 py-1 rounded inline-block">
                    ⌛ En cours
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded inline-block">
                    ❌ En attente
                  </span>
                )}

                {/* ✅ BOUTON TIMER */}
                {!exercise.completed && isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("restTimer");
                    }}
                    className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-2.5 py-1 rounded-full md:rounded inline-flex items-center gap-1.5 transition shadow-sm hover:shadow-md cursor-pointer"
                    title="Démarrer le timer de repos"
                  >
                    <Timer size={13} />
                    <span className="hidden md:inline">Démarrer le timer</span>
                    <span className="font-semibold">
                      {exercise.restTime || 90}s
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Flèche */}
          <span
            className={`text-2xl ${isExpanded ? "" : "-rotate-90"} transition`}
          >
            ▼
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* DÉTAIL SI COMPLÉTÉ : Afficher résumé + bouton réouvrir */}
        {/* ═══════════════════════════════════════════════════════ */}
        {isExpanded && exercise.completed && (
          <>
            <div
              className={`mt-4 space-y-3 border-t pt-4   ${
                exercise.completed ? "opacity-60" : ""
              }`}
            >
              {/* Résumé des séries */}
              <div>
                <p className="font-semibold mb-2">Séries réalisées :</p>
                {exercise.actualSets?.map((set, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    Série {index + 1}: {set.weight}kg × {set.reps} reps
                    {set.completed && " ✓"}
                  </p>
                ))}
              </div>

              {/* Notes */}
              {exercise.notes && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-700">
                    📝 Notes :
                  </p>
                  <p className="text-sm text-gray-600">{exercise.notes}</p>
                </div>
              )}

              {/* Effort */}
              {exercise.effort && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    💪 Effort : {exercise.effort}/10
                  </p>
                </div>
              )}
            </div>

            {/* ✅ BOUTON RÉOUVRIR  */}
            <div className="my-3">
              <Button onClick={() => onReopenExercise(index)}>
                🔄 Réouvrir cet exercice
              </Button>
            </div>
          </>
        )}

        {/* Détail des séries (déplié) */}
        <AnimatePresence>
          {isExpanded && !exercise.completed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-7 "
            >
              {/* Afficher les séries) */}
              {Array.from({ length: exercise.targetSets }).map(
                (_, setIndex) => (
                  <SetRow
                    key={setIndex}
                    setIndex={setIndex}
                    setData={exercise.actualSets[setIndex]}
                    onSetChange={(field, value) =>
                      onSetChange(index, setIndex, field, value)
                    }
                    onSetComplete={() => onSetComplete(index, setIndex)}
                  />
                ),
              )}

              {/* ✅ EFFORT / RPE */}

              <div className="mt-4">
                <label
                  htmlFor={`effort-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  💪 Effort ressenti (RPE)
                  <span className="text-gray-500 text-xs ml-2">(1-10)</span>
                </label>

                <div className="flex items-center justify-center gap-3">
                  <input
                    id={`effort-${index}`}
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={localEffort ?? ""}
                    onChange={(e) => handleEffortChange(e.target.value)}
                    className="input w-24 text-center pt-2 text-lg font-bold"
                  />

                  <div className=" text-xs text text-gray-500">
                    {localEffort === null || localEffort === undefined ? (
                      <span className="italic">Non renseigné</span>
                    ) : localEffort <= 3 ? (
                      <span className="text-green-600"> Très facile</span>
                    ) : localEffort <= 6 ? (
                      <span className="text-primary-600"> Modéré</span>
                    ) : localEffort <= 8 ? (
                      <span className="text-accent-600"> Intense</span>
                    ) : (
                      <span className="text-red-600"> Maximum</span>
                    )}
                  </div>
                </div>

                {/* Légende */}
                <div className="mt-2 text-xs text-center text-gray-400 space-y-1">
                  <p>
                    1-3 = Très facile • 4-6 = Modéré • 7-8 = Intense • 9-10 =
                    Maximum
                  </p>
                </div>
              </div>

              {/* ✅ NOTES  */}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Commentaires (optionnel)
                </label>
                <textarea
                  value={exercise.notes || ""}
                  onChange={(e) => onNotesChange(index, e.target.value)}
                  placeholder="Ex: Forme excellente, j'ai augmenté le poids..."
                  className="input w-full p-2 md:p-4 text-xs md:text-sm placeholder:text-xs md:placeholder:text-base placeholder:text-primary-300 placeholder:font-light"
                  rows={2}
                />
              </div>

              {/* BOUTON TERMINER */}

              <Button full onClick={() => onExerciseComplete(index)}>
                Exercice terminé
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isOpen("restTimer") && (
        <RestTimerModal initialTime={exercise.restTime} />
      )}
    </>
  );
}
