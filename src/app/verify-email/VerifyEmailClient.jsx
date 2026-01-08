"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Configuration des différents états
const STATUS_CONFIG = {
  loading: {
    icon: null,
    title: "Vérification en cours...",
    color: "text-gray-600",
    showSpinner: true,
  },
  success: {
    icon: "🎉",
    title: "✅ Email vérifié !",
    color: "text-green-600",
    description:
      "Votre compte est maintenant actif. Vous pouvez vous connecter et profiter de toutes les fonctionnalités de FitBuilder.",
    showLoginButton: true,
  },
  already_verified: {
    icon: "✓",
    title: "Email déjà vérifié",
    color: "text-blue-600",
    description:
      "Votre email a déjà été vérifié. Vous pouvez vous connecter directement.",
    showLoginButton: true,
  },
  expired: {
    icon: "⏰",
    title: "⏱️ Lien expiré",
    color: "text-orange-600",
    description:
      "Ce lien de vérification a expiré (24 heures). Vous pouvez demander un nouveau lien.",
    showResendButton: true,
  },
  error: {
    icon: "⚠️",
    title: "❌ Erreur de vérification",
    color: "text-red-600",
    description:
      "Le lien de vérification est invalide ou a rencontré une erreur.",
    showResendButton: true,
    showBackButton: true,
  },
};

export default function VerifyEmailClient({ token }) {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Aucun token de vérification fourni.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus(data.alreadyVerified ? "already_verified" : "success");
          setMessage(data.message);
        } else {
          setStatus(data.expired ? "expired" : "error");
          setMessage(data.error || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur vérification:", error);
        setStatus("error");
        setMessage("Une erreur est survenue lors de la vérification");
      }
    };

    verifyEmail();
  }, [token]);

  // Récupère la config pour le status actuel
  const config = STATUS_CONFIG[status];

  return (
    <>
      <h1>{config.title}</h1>

      <div className="flex flex-col items-center gap-4 mt-8 max-w-lg text-center">
        {/* Spinner (loading uniquement) */}
        {config.showSpinner && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        )}

        {/* Icône */}
        {config.icon && <div className="text-6xl">{config.icon}</div>}

        {/* Message dynamique */}
        {message && (
          <p className={`text-lg font-semibold ${config.color}`}>{message}</p>
        )}

        {/* Description */}
        {config.description && (
          <p className="text-gray-600">{config.description}</p>
        )}

        {/* Boutons */}
        <div className="flex gap-4 mt-4">
          {config.showLoginButton && (
            <Link
              href="/"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Se connecter
            </Link>
          )}

          {config.showResendButton && (
            <Link
              href="/resend-verification"
              className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Demander un nouveau lien
            </Link>
          )}

          {config.showBackButton && (
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Retour à la connexion
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
