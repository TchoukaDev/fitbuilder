import z from "zod";

export const workoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Veuillez choisir un nom" })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
  description: z.string().optional(),
  category: z
    .string()
    .min(1, { message: "Veuillez sélectionner une catégorie" }),
  estimatedDuration: z
    .number({
      message: "Veuillez saisir une durée estimée",
    })
    .min(0, { message: "La durée ne peut pas être négative" }),
});

// Schema pour valider que les exercices ne sont pas vides
export const workoutExercisesSchema = z.object({
  exercises: z
    .array(z.any())
    .min(1, { message: "Veuillez ajouter au moins un exercice" }),
});
