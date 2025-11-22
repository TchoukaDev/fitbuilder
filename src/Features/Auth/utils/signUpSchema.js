import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, "Veuillez saisir un nom d'utilisateur")
      .max(30, "votre nom d'utilisateur ne peut pas dépasser 30 caractères"),

    email: z.string().email("Veuillez saisir une adresse email valide"),

    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre")
      .regex(
        /[^A-Za-z0-9]/,
        "Le mot de passe doit contenir un caractère spécial",
      ),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
