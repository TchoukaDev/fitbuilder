import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Veuillez saisir une adresse email valide")
    .email("Veuillez saisir une adresse email valide"),

  password: z
    .string()
    .min(1, "Veuillez saisir votre mot de passe")
    .refine(
      (value) => value.trim() !== "",
      "Veuillez saisir votre mot de passe",
    ),

  autoLogin: z.boolean().optional().default(true),
});
