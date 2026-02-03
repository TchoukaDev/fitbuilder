"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/Global/components";


type Status = "loading" | "success" | "already_verified" | "expired" | "error";

type StatusConfig = {
  title: string;
  color: string;
  showSpinner?: boolean;
  description?: string;
  showLoginButton?: boolean;
  showResendButton?: boolean;
  showBackButton?: boolean;
};

export default function VerifyEmailClient({ token }: { token: string | undefined }) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Configuration des différents états
  const STATUS_CONFIG: Record<Status, StatusConfig> = {
    loading: {
      title: "Vérification en cours...",
      color: "text-gray-600",
      showSpinner: true,
    },
    success: {
      title: `L'email ${email} a été vérifié !`,
      color: "text-green-600",
      description:
        "Votre compte est maintenant actif. Vous pouvez vous connecter et profiter de toutes les fonctionnalités de FitBuilder.",
      showLoginButton: true,
    },
    already_verified: {
      title: `Email ${email} déjà vérifié`,
      color: "text-primary-500",
      description: `Votre email a déjà été vérifié. Vous pouvez vous connecter directement.`,
      showLoginButton: true,
    },
    expired: {
      title: `Lien expiré pour l'email ${email}`,
      color: "text-accent-500",
      description:
        "Ce lien de vérification a expiré. Vous pouvez demander un nouveau lien.",
      showResendButton: true,
    },
    error: {
      title: `Erreur de vérification pour l'email ${email}`,
      color: "text-accent-500",
      description:
        "Le lien de vérification est invalide ou a rencontré une erreur.",
      showResendButton: true,
      showBackButton: true,
    },
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Aucun token de vérification fourni.");
      setEmail("");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus(data.alreadyVerified ? "already_verified" : "success");
          setMessage(data.message);
          setEmail(data.email || "");
        } else {
          setStatus(data.expired ? "expired" : "error");
          setMessage(data.error || "Une erreur est survenue");
          setEmail(data.email || "");
        }
      } catch (error) {
        console.error("Erreur vérification:", error);
        setStatus("error");
        setMessage("Une erreur est survenue lors de la vérification");
        setEmail("");
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
          {config.showBackButton && (
            <Button asChild close>
              <Link href="/">Retour à la connexion</Link>
            </Button>
          )}
          {config.showLoginButton && (
            <Button asChild>
              <Link href="/">Se connecter</Link>
            </Button>
          )}

          {config.showResendButton && (
            <Button asChild>
              <Link href="/resend-verification">Demander un nouveau lien</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
