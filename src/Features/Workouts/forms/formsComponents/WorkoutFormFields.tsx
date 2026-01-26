"use client";

// Bloc de formulaire pour les informations générales d'un plan d'entraînement.
import { Label } from "@/Global/components";
import { handleKeyDown } from "@/Global/utils";
import { useRef, useEffect } from "react";
import { FieldErrors, UseFormRegister, UseFormRegisterReturn } from "react-hook-form";
import { WorkoutSchemaType } from "../../utils/workoutSchema";

type FormData = Partial<WorkoutSchemaType>


interface WorkoutFormFieldsProps {
  register: UseFormRegister<FormData>,
  errors: FieldErrors<FormData>,
  watchedFields: Record<string, string>,
  nameRegister: UseFormRegisterReturn<string>

}

export default function WorkoutFormFields({
  register,
  errors,
  watchedFields,
  nameRegister,
}: WorkoutFormFieldsProps) {
  const nameRef = useRef<HTMLInputElement | null>(null);

  // Focus automatique sur le champ name
  useEffect(() => {
    nameRef?.current?.focus();
  }, []);
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
            {...nameRegister}
            ref={(e) => {
              nameRegister.ref(e);
              nameRef.current = e;
            }}
          />
          <Label htmlFor="name" value={watchedFields.name}>
            Nom du plan <span className="text-accent-500">*</span>
          </Label>
          {errors?.name && (
            <p className="formError mt-1">{errors?.name?.message}</p>
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
            {...register("estimatedDuration", { valueAsNumber: true })}
          />
          <Label
            htmlFor="estimatedDuration"
            value={watchedFields.estimatedDuration}
          >
            Durée estimée (minutes) <span className="text-accent-500">*</span>
          </Label>
          {errors?.estimatedDuration && (
            <p className="formError mt-1">
              {errors?.estimatedDuration?.message}
            </p>
          )}
        </div>

        {/* Catégorie */}

        <div className="flex flex-col gap-3">
          {" "}
          <label
            htmlFor="category"
            className="text-sm  text-primary-500 font-semibold"
          >
            Catégorie: <span className="text-accent-500">*</span>
          </label>
          <select
            id="category"
            {...register("category")}
            className="input pt-2"
          >
            <option value="">--- Sélectionner une catégorie ---</option>
            <option value="Push">Push (Poussée)</option>
            <option value="Pull">Pull (Tirage)</option>
            <option value="Legs">Legs (Jambes)</option>
            <option value="Full Body">Full Body (Corps entier)</option>
            <option value="Cardio">Cardio</option>
            <option value="Autre">Autre</option>
          </select>
          {errors?.category && (
            <p className="formError mt-1">{errors?.category?.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
