"use client";

import { useModals } from "@/Providers/Modals";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function useWorkoutForm({ workout = null, newForm = false }) {
  // State
  const [formData, setFormData] = useState({
    exercises: workout?.exercises || [],
  });
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Modal
  const { getModalData, closeModal } = useModals();

  // Ajouter exercice
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

  // Modifier un exercice existant
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

  // Supprimer exercice et modifier ordre
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

  // Réorganiser les exercises
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

  // Load from localStorage
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

  // Save to localStorage
  useEffect(() => {
    if (hasLoaded && newForm) {
      localStorage.setItem("exercises", JSON.stringify(formData.exercises));
    }
  }, [formData.exercises, hasLoaded, newForm]);

  // Clear localStorage
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
    selectExercise,
    removeExercise,
    updateExercise,
    moveExercise,
    clearStorage,
    formData,
  };
}
