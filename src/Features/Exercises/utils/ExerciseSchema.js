import z from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, { message: "Veuillez choisir un nom" }),
  muscle: z.string().min(1, { message: "Veuillez choisir un muscle" }),
  description: z.string().optional(),
  equipment: z.string().min(1, { message: "Veuillez choisir un équipement" }),
});
