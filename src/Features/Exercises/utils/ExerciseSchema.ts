import z from "zod";

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, { message: "Veuillez choisir un nom" }),
  primary_muscle: z.string().trim().min(1, { message: "Veuillez sélectionner au moins un muscle" }),
  secondary_muscles: z.array(z.string()),
  description: z.string().optional(),
  equipment: z
    .string()
    .trim()
    .min(1, { message: "Veuillez choisir un équipement" }),
});

// Type inféré du schema - utilisable partout (front + API)
export type ExerciseFormData = z.infer<typeof exerciseSchema>;