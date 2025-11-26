"use client";

import { useModals } from "@/Providers/Modals";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

/**
 * Hook pour gérer le formulaire de workout (liste d'exercices + localStorage).
 *
 * @param {{ workout?: { exercises?: any[] } | null, newForm?: boolean }} params
 */
export function useWorkoutForm({ workout = null, newForm = false }) {
  // Etat principal du formulaire
  const [formData, setFormData] = useState({
    exercises: workout?.exercises || [],
  });
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Modal
  const { getModalData, closeModal } = useModals();

  /**
   * Ajoute un exercice à la fin de la liste.
   * @param {Object} selectedExercise
   */
  const selectExercise = (selectedExercise) => {
    const orderedExercise = {
      ...selectedExercise,
      order: formData.exercises.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, orderedExercise],
    }));
  };

  /**
   * Met à jour l'exercice en cours d'édition (index récupéré via `getModalData`).
   * @param {Object} updatedExercise
   */
  const updateExercise = (updatedExercise) => {
    const newExercises = formData.exercises.map((ex, i) =>
      i === getModalData("workoutEditExercise").index
        ? { ...updatedExercise, order: ex.order }
        : ex,
    );

    setFormData({ ...formData, exercises: newExercises });
    closeModal("workoutEditExercise");
    toast.success("Exercice modifié");
  };

  /**
   * Supprime un exercice (index provenant du modal `deleteConfirm`) et recalcule `order`.
   * @param {number} index
   */
  const removeExercise = (index) => {
    const reorderedExercises = formData.exercises
      .filter((ex, i) => i !== getModalData("deleteConfirm").index)
      .map((ex, i) => ({ ...ex, order: i + 1 }));

    setFormData({
      ...formData,
      exercises: reorderedExercises,
    });
    closeModal("deleteConfirm");
  };

  /**
   * Déplace un exercice dans la liste puis recalcule `order`.
   * @param {number} index
   * @param {"up"|"down"} direction
   */
  const moveExercise = (index, direction) => {
    const newExercises = [...formData.exercises];
    if (direction === "up" && index > 0) {
      [newExercises[index - 1], newExercises[index]] = [
        newExercises[index],
        newExercises[index - 1],
      ];
    } else if (direction === "down" && index < newExercises.length - 1) {
      [newExercises[index], newExercises[index + 1]] = [
        newExercises[index + 1],
        newExercises[index],
      ];
    }
    const reorderedExercises = newExercises.map((ex, i) => ({
      ...ex,
      order: i + 1,
    }));
    setFormData({ ...formData, exercises: reorderedExercises });
  };

  /**
   * Charge les exercices depuis `localStorage` au montage si `newForm` est vrai.
   */
  useEffect(() => {
    if (newForm) {
      const stored = localStorage.getItem("exercises");
      if (stored) {
        setFormData((prev) => ({
          ...prev,
          exercises: JSON.parse(stored),
        }));
      }
    }

    setHasLoaded(true);
    setIsMounted(true);
  }, []);

  /**
   * Sauvegarde `formData.exercises` dans `localStorage` quand ils changent.
   */
  useEffect(() => {
    if (hasLoaded && newForm) {
      localStorage.setItem("exercises", JSON.stringify(formData.exercises));
    }
  }, [formData.exercises, hasLoaded, newForm]);

  /**
   * Supprime la clé `"exercises"` du `localStorage` pour un nouveau formulaire.
   */
  const clearStorage = () => {
    if (newForm) {
      localStorage.removeItem("exercises");
    }
  };

  return {
    error,
    setError,
    isMounted,
    selectExercise,
    removeExercise,
    updateExercise,
    moveExercise,
    clearStorage,
    formData,
  };
}
