import z from "zod";

export const workoutSchema = z.object({
  name: z.string().min(1, { message: "Veuillez choisir un nom" }),
  description: z.string().optional(),
  category: z
    .string()
    .min(1, { message: "Veuillez sélectionner une catégorie" }),
  estimatedDuration: z
    .number({ message: "Veuillez saisir une durée estimée" })
    .min(1, { message: "Veuillez saisir une durée estimée" }),
});
