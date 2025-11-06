"use client";
import Button from "@/components/Buttons/Button";
import Label from "@/components/Forms/FormsComponents/Label/Label";
import SelectExercicesModal from "@/components/Modals/SelectExercicesModal/SelectExercicesModal";
import { SquareArrowDown, SquareArrowUp, SquareX } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeatLoader, ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function WorkoutTemplateForm({
  allExercises,
  favorites,
  isAdmin,
  userId,
}) {
  const [formData, setFormData] = useState({
    exercises: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      estimatedDuration: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedFields = watch(); // pour pouvoir voir les changements si nécessaire

  const handleCloseExerciseSelector = () => setIsOpen(false);

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

  const handleRemoveExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((ex, i) => i !== index),
    });
  };

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

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      if (formData.exercises.length === 0) {
        setError("Veuillez ajouter au moins un exercice");
        setLoading(false);
        return;
      }
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, exercises: formData.exercises }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue");
      }
      const result = await response.json();
      toast.success(result.message);
      localStorage.removeItem("exercises");
      router.push("/workouts");
      router.refresh();
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedExercises = localStorage.getItem("exercises");
    if (storedExercises) {
      setFormData((prev) => ({
        ...prev,
        exercises: JSON.parse(storedExercises),
      }));
    }
    setHasLoaded(true);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("exercises", JSON.stringify(formData.exercises));
    }
  }, [formData.exercises, hasLoaded]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col xl:flex-row gap-10 items-center xl:items-start justify-between max-h-[300px]">
          <div className="flex flex-col gap-5 items-center">
            {/* Nom */}
            <div className="relative">
              <input
                className="input peer"
                placeholder=""
                {...register("name", { required: "Veuillez choisir un nom" })}
              />
              <Label htmlFor="name" value={watchedFields.name}>
                Nom*
              </Label>
              {errors.name && (
                <p className="formError my-3">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="relative">
              <textarea
                className="input peer"
                placeholder=""
                rows={2}
                {...register("description")}
              />
              <Label htmlFor="description" value={watchedFields.description}>
                Description
              </Label>
              {errors.description && (
                <p className="formError my-3">{errors.description.message}</p>
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
                <option value="" className="font-semibold">
                  --- Catégorie* ---
                </option>
                <option value="Push">Push (Poussée)</option>
                <option value="Pull">Pull (Tirage)</option>
                <option value="Legs">Legs (Jambes)</option>
                <option value="Full Body">Full Body (Corps entier)</option>
                <option value="Cardio">Cardio</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.category && (
                <p className="formError my-3">{errors.category.message}</p>
              )}
            </div>
            {/* Durée */}
            <div className="relative">
              <input
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
                Durée estimée*
              </Label>
              {errors.estimatedDuration && (
                <p className="formError my-3">
                  {errors.estimatedDuration.message}
                </p>
              )}
            </div>
            {/* Bouton Ajouter */}
            <Button type="button" onClick={() => setIsOpen(true)}>
              + Ajouter un exercice
            </Button>
          </div>

          {/* Section Exercices */}
          <div>
            <h2>Exercices sélectionnés* ({formData.exercises.length})</h2>
            {!isMounted ? (
              <div className="flex justify-center items-center">
                <BeatLoader size={10} color="#7557ff" />
              </div>
            ) : (
              <div className="mt-4">
                {formData.exercises.length === 0 ? (
                  <p className="text-gray-500">
                    Aucun exercice ajouté pour le moment.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-auto">
                    <AnimatePresence mode="popLayout">
                      {formData.exercises.map((exercise, index) => (
                        <motion.div
                          key={exercise._id}
                          layout
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                          className="border border-gray-300 p-4 rounded-lg flex  items-center"
                        >
                          <div className="flex flex-col md:flex-row gap-5 items-center justify-between w-full">
                            <div>
                              <p className="font-semibold mb-3">
                                {exercise.order}. {exercise.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {exercise.sets} séries × {exercise.reps} reps
                                {exercise.targetWeight &&
                                  ` - ${exercise.targetWeight}kg`}
                                {exercise.restTime &&
                                  ` - Temps de repos: ${exercise.restTime}`}
                              </p>
                              {exercise.notes && (
                                <p className="text-sm text-gray-600 italic">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-center items-center gap-1">
                              <button
                                className="cursor-pointer"
                                type="button"
                                title="Retirer l'exercice"
                                onClick={() => handleRemoveExercise(index)}
                              >
                                <SquareX color="#ff6600" />
                              </button>
                              {formData.exercises.length > 1 && (
                                <div className="flex justify-center items-center gap-1">
                                  {index !== 0 && (
                                    <button
                                      className="cursor-pointer"
                                      title="Déplacer l'exercice"
                                      type="button"
                                      onClick={() =>
                                        handleMoveExercise(index, "up")
                                      }
                                    >
                                      <SquareArrowUp />
                                    </button>
                                  )}
                                  {index !== formData.exercises.length - 1 && (
                                    <button
                                      className="cursor-pointer"
                                      title="Déplacer l'exercice"
                                      type="button"
                                      onClick={() =>
                                        handleMoveExercise(index, "down")
                                      }
                                    >
                                      <SquareArrowDown />
                                    </button>
                                  )}
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
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-center self-center gap-2">
            {error && <div className="formError">{error}</div>}
            <Button disabled={loading} type="submit">
              {loading ? (
                <>
                  <span>Validation en cours...</span>
                  <ClipLoader size={15} color="#e8e3ff" />
                </>
              ) : (
                "Créer l'entraînement"
              )}
            </Button>
            <div className="text-xs text-end">(*) champs obligatoires</div>
          </div>
        </div>
      </form>

      {/* Modale de sélection d'exercices */}
      {isOpen && (
        <SelectExercicesModal
          userId={userId}
          isAdmin={isAdmin}
          onSelectExercise={handleSelectExercise}
          onCloseExerciseSelector={handleCloseExerciseSelector}
          allExercises={allExercises}
          favorites={favorites}
        />
      )}
    </>
  );
}
