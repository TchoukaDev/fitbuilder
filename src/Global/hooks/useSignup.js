"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

/**
 * Gère l'inscription utilisateur (appel API + gestion des erreurs serveur).
 */
export function useSignUp() {
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState({});

  /**
   * Envoie les données d'inscription à l'API.
   *
   * @param {Object} data - Données du formulaire (email, mot de passe, etc.).
   */
  const signUp = async (data) => {
    setServerErrors({});

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.fieldErrors) {
          setServerErrors(result.fieldErrors);
          return { success: false };
        }
      }

      toast.success(result.message || "Compte créé avec succès !");
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Erreur signup:", error);
      toast.error(error?.message || "Erreur lors de l'inscription");
      return { success: false };
    }
  };

  /**
   * Efface l'erreur serveur pour un champ spécifique.
   *
   * @param {string} fieldName - Nom du champ à nettoyer.
   */
  const clearServerError = (fieldName) => {
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
