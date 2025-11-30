import z from "zod";

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, { message: "Veuillez choisir un nom" }),
  muscle: z.string().trim().min(1, { message: "Veuillez choisir un muscle" }),
  description: z.string().optional(),
  equipment: z
    .string()
    .trim()
    .min(1, { message: "Veuillez choisir un équipement" }),
});
