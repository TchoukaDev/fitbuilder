"use client";

// Bloc de formulaire pour les informations générales d'un plan d'entraînement.
import { Label } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";

export default function WorkoutFormFields({ register, errors, watchedFields }) {
  return (
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
            onKeyDown={handleKeyDown}
            className="input peer"
            placeholder=""
            {...register("estimatedDuration", {
              required: "Veuillez saisir une durée estimée",
              valueAsNumber: true,
            })}
          />
          <Label
            htmlFor="estimatedDuration"
            value={watchedFields.estimatedDuration}
          >
            Durée estimée (minutes)*
          </Label>
          {errors.estimatedDuration && (
            <p className="formError mt-1">{errors.estimatedDuration.message}</p>
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
  );
}
