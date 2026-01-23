"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { SignUpSchemaType } from "../utils";


/**
 * Gère l'inscription utilisateur (appel API + gestion des erreurs serveur).
 */
export function useSignUp() {
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  /**
   * Envoie les données d'inscription à l'API.
   *
   * @param {Object} data - Données du formulaire (email, mot de passe, etc.).
   */
  const signUp = async (data: SignUpSchemaType) => {
    setServerErrors({});

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // ✅ Gestion des erreurs de validation
      if (result.fieldErrors) {
        setServerErrors(result.fieldErrors);
        return { success: false };
      }

      // ✅ Gestion des autres erreurs
      if (!response.ok || !result.success) {
        toast.error(result.error || "Erreur lors de l'inscription");
        return { success: false };
      }

      // ✅ Succès
      toast.success(
        result.message ||
        "Compte créé avec succès ! Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte mail (pensez aux spams).",
      );
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Erreur signup:", error);

      let errorMessage = "Erreur lors de l'inscription";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
      return { success: false };
    }
  };

  /**
   * Efface l'erreur serveur pour un champ spécifique.
   *
   * @param {string} fieldName - Nom du champ à nettoyer.
   */
  const clearServerError = (fieldName: string) => {
    if (serverErrors[fieldName]) {
      setServerErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return {
    signUp,
    serverErrors,
    clearServerError,
  };
}
