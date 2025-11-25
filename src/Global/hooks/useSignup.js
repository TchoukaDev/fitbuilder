"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useSignUp() {
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const signUp = async (data) => {
    setServerErrors({});
    setGlobalError("");

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
        }
        if (result.error) {
          setGlobalError(result.error);
        }
        return { success: false };
      }

      toast.success(result.message || "Compte créé avec succès !");
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Erreur signup:", error);
      const errorMsg = "Une erreur est survenue. Veuillez réessayer.";
      setGlobalError(errorMsg);
      toast.error(errorMsg);
      return { success: false };
    }
  };

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
    globalError,
    clearServerError,
  };
}
