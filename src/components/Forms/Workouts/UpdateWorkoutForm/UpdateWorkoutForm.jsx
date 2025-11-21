"use client";
import Button from "@/components/Buttons/Button";
import Label from "@/components/Forms/FormsComponents/Label/Label";
import SelectExercicesModal from "@/components/Modals/SelectExercicesModal/SelectExercicesModal";
import {
  SquareArrowDown,
  SquareArrowUp,
  SquareX,
  Plus,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeatLoader, ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUpdateWorkout } from "@/hooks/useWorkouts";
import EditExerciseModal from "@/components/Modals/EditExerciseModal/EditExerciseModal";
import { useModals } from "@/Context/ModalsContext/ModalContext";

export default function UpdatedWorkoutForm({
  workout, // ✅ Le workout à modifier
  allExercises,
  favorites,
  isAdmin,
  userId,
}) {
  // State
  const [formData, setFormData] = useState({
    exercises: workout.exercises || [], // ✅ Pré-remplir avec les exercices existants
  });
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Modals
  const { isOpen, openModal, closeModal, getModalData } = useModals();

  // Variables
  const router = useRouter();
  const exercisesAdded = formData.exercises;
  const { mutate: updateWorkout, isPending } = useUpdateWorkout(userId);

  // React Hook Form avec valeurs pré-remplies
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: workout.name || "",
      description: workout.description || "",
      category: workout.category || "",
      estimatedDuration: workout.estimatedDuration || "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedFields = watch();

  // Ajouter exercice
  const handleSelectExercise = (selectedExercise) => {
    const orderedExercise = {
      ...selectedExercise,
      order: formData.exercises.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, orderedExercise],
    }));
  };

  // ✅ Modifier un exercice existant
  const handleUpdateExercise = (updatedExercise) => {
    const newExercises = formData.exercises.map((ex, i) =>
      i === getModalData("editExercise").index
        ? { ...updatedExercise, order: ex.order }
        : ex,
    );

    setFormData({ ...formData, exercises: newExercises });
    closeModal("editExercise");
    toast.success("Exercice modifié");
  };

  // Supprimer exercice et recalculer l'ordre
  const handleRemoveExercise = (index) => {
    const reorderedExercises = formData.exercises
      .filter((ex, i) => i !== index)
      .map((ex, i) => ({ ...ex, order: i + 1 }));

    setFormData({
      ...formData,
      exercises: reorderedExercises,
    });
  };

  // Réorganiser les exercices
  const handleMoveExercise = (index, direction) => {
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

  // Gestion du formulaire
  const onSubmit = async (data) => {
    setError("");
    if (formData.exercises.length === 0) {
      setError("Veuillez ajouter au moins un exercice");
      return;
    }

    updateWorkout(
      {
        id: workout._id,
        updatedWorkout: { ...data, exercises: formData.exercises },
      },
      {
        onSuccess: (result) => {
          router.push(`/workouts/${workout._id}`);
          router.refresh();
        },
        onError: (err) => {
          setError(err.message || "Une erreur est survenue");
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // RENDER
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6 place-items-center">
            {/* Nom */}
            <div className="relative">
              <input
                className="input peer"
                placeholder=""
                {...register("name", { required: "Veuillez choisir un nom" })}
              />
              <Label htmlFor="name" value={watchedFields.name}>
                Nom du plan*
              </Label>
              {errors.name && (
                <p className="formError mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="relative">
              <textarea
                className="input peer"
                placeholder=""
                rows={3}
                {...register("description")}
              />
              <Label htmlFor="description" value={watchedFields.description}>
                Description
              </Label>
            </div>

            {/* Durée estimée */}
            <div className="relative">
              <input
                type="number"
                className="input peer"
                placeholder=""
                {...register("estimatedDuration", {
                  required: "Veuillez saisir une durée estimée",
                })}
              />
              <Label
                htmlFor="estimatedDuration"
                value={watchedFields.estimatedDuration}
              >
                Durée estimée (minutes)*
              </Label>
              {errors.estimatedDuration && (
                <p className="formError mt-1">
                  {errors.estimatedDuration.message}
                </p>
              )}
            </div>

            {/* Catégorie */}
            <div>
              <select
                {...register("category", {
                  required: "Veuillez sélectionner une catégorie",
                })}
                className="input pt-2"
              >
                <option value="">--- Catégorie* ---</option>
                <option value="Push">Push (Poussée)</option>
                <option value="Pull">Pull (Tirage)</option>
                <option value="Legs">Legs (Jambes)</option>
                <option value="Full Body">Full Body (Corps entier)</option>
                <option value="Cardio">Cardio</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.category && (
                <p className="formError mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Exercices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-900">
              Exercices du plan ({formData.exercises.length})
            </h2>

            <Button type="button" onClick={() => openModal("selectExercise")}>
              <Plus size={20} />
              Ajouter un exercice
            </Button>
          </div>

          {!isMounted ? (
            <div className="flex justify-center items-center py-12">
              <BeatLoader size={10} color="#7557ff" />
            </div>
          ) : formData.exercises.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">
                Aucun exercice ajouté pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {formData.exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise._id || index}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Numéro */}
                      <div className="shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                        {exercise.order}
                      </div>

                      {/* Infos exercice */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {exercise.name}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          <span className="font-medium">
                            {exercise.sets} séries × {exercise.reps} reps
                          </span>

                          <span>
                            🏋️{" "}
                            {exercise.targetWeight === 0
                              ? "Poids du corps"
                              : exercise.targetWeight + "kg"}{" "}
                          </span>

                          {exercise.restTime && (
                            <span>⏱️ Repos: {exercise.restTime}s</span>
                          )}
                        </div>

                        {exercise.notes && (
                          <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded">
                            📝 {exercise.notes}
                          </p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex gap-1">
                          {/* ✅ Bouton MODIFIER */}
                          <button
                            type="button"
                            onClick={() =>
                              openModal("editExercise", { exercise, index })
                            }
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="Modifier l'exercice"
                          >
                            <Edit size={20} />
                          </button>

                          {/* Bouton supprimer */}
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Retirer l'exercice"
                          >
                            <SquareX size={20} />
                          </button>
                        </div>

                        {/* Boutons déplacer */}
                        {formData.exercises.length > 1 && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(index, "up")}
                              disabled={index === 0}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded disabled:text-gray-300 disabled:hover:bg-transparent transition cursor-pointer"
                              title="Déplacer vers le haut"
                            >
                              <SquareArrowUp size={20} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveExercise(index, "down")}
                              disabled={index === formData.exercises.length - 1}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded disabled:text-gray-300 disabled:hover:bg-transparent transition cursor-pointer"
                              title="Déplacer vers le bas"
                            >
                              <SquareArrowDown size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Message d'erreur global */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Champs obligatoires
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              close
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>

            <Button disabled={isPending} type="submit">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <ClipLoader size={15} color="#e8e3ff" />
                  Modification en cours...
                </span>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Modale de sélection d'exercices */}
      {isOpen && (
        <SelectExercicesModal
          exercisesAdded={exercisesAdded}
          userId={userId}
          isAdmin={isAdmin}
          onSelectExercise={handleSelectExercise}
          allExercises={allExercises}
          favorites={favorites}
        />
      )}

      {/* ✅ Modale d'édition d'exercice */}
      {isOpen("editExercise") && (
        <EditExerciseModal
          exercise={getModalData("editExercise").exercise}
          onSave={handleUpdateExercise}
        />
      )}
    </>
  );
}
