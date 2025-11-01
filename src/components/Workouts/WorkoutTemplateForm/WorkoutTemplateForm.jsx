"use client";
import Button from "@/components/Buttons/Button";
import Label from "@/components/Forms/FormsComponents/Label/Label";
import SelectExercicesModal from "@/components/Modals/SelectExercicesModal/SelectExercicesModal";
import { useEffect, useState } from "react";

export default function WorkoutTemplateForm({ allExercices, favorites }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    exercises: [
      {
        exerciseId: "123",
        exerciseName: "Développé couché",
        sets: 4,
        reps: "8-12",
        targetWeight: 80,
      },
    ],
  });
  const [error, setError] = useState("");
  const [loading, isLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectExercice = (selectedExercise) => {
    setFormData({ ...formData, exercises: selectedExercise });
  };

  const handleSubmit = () => {
    console.log("hello");
  };

  // Suppression d'un exercice
  const handleRemoveExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((exercice, i) => i !== index),
    });
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur */}
      {error && <div className="formError">{error}</div>}

      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Label htmlFor="name" value={formData.name}>
          Nom*
        </Label>
      </div>
      <div className="relative">
        <textarea
          className="input peer"
          required
          placeholder=""
          id="description"
          name="description"
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <Label htmlFor="description" value={formData.description}>
          Description
        </Label>{" "}
      </div>

      {/* Section Exercices */}
      <div>
        <div className="flex justify-center items-center gap-10">
          <h2>Exercices sélectionnés({formData.exercises.length})</h2>

          {/* Bouton Ajouter */}
          <Button type="button" onClick={() => setIsOpen(true)}>
            + Ajouter un exercice
          </Button>
        </div>
        {/* Modale de sélection d'exercices */}
        {isOpen && (
          <SelectExercicesModal
            onSelectExercise={handleSelectExercice}
            onClose={handleClose}
            initialExercises={allExercices}
            favorites={favorites}
          />
        )}

        {/* Liste des exercices OU message si vide */}
        <div className="mt-4">
          {formData.exercises.length === 0 ? (
            <p className="text-gray-500">
              Aucun exercice ajouté pour le moment.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {formData.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="border border-gray-300 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {index + 1}. {exercise.exerciseName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} séries × {exercise.reps} reps
                      {exercise.targetWeight && ` - ${exercise.targetWeight}kg`}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    close
                  >
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <Button disabled={loading} type="submit">
          {loading ? (
            <>
              <span>Validation en cours...</span>
              <ClipLoader size={15} color="#e8e3ff" />
            </>
          ) : (
            "Valider"
          )}
        </Button>
      </div>

      <div className="text-xs text-end">(*) champs obligatoires</div>
    </form>
  );
}
