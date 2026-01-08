"use client";

import { useState } from "react";
import { LoaderButton, Label } from "@/Global/components";
import { toast } from "react-toastify";

export default function ResendVerificationClient() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simple côté client
    if (!email || !email.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (data.success) {
        // Succès : affiche le message et marque comme envoyé
        setEmailSent(true);
        toast.success(data.message);
      } else {
        // Erreur : affiche le message d'erreur
        if (data.alreadyVerified) {
          // Cas spécial : email déjà vérifié
          toast.info(data.error);
        } else {
          toast.error(data.error || "Une erreur est survenue");
        }
      }
    } catch (error) {
      console.error("Erreur renvoi email:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage après envoi réussi
  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 max-w-lg text-center">
        <div className="text-6xl">📧</div>
        <p className="text-lg text-green-600 font-semibold">
          Email envoyé avec succès !
        </p>
        <p className="text-gray-600">
          Un nouveau lien de vérification a été envoyé à{" "}
          <strong>{email}</strong>. Consultez votre boîte mail (pensez à
          vérifier les spams).
        </p>
        <button
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
          className="mt-4 text-primary-500 hover:text-primary-600 font-semibold underline"
        >
          Renvoyer à une autre adresse
        </button>
      </div>
    );
  }

  // Formulaire de saisie
  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <div className="relative">
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
          className="input peer"
          autoComplete="email"
          required
          disabled={isLoading}
        />
        <Label htmlFor="email" value={email}>
          Adresse email
        </Label>
      </div>

      <LoaderButton
        type="submit"
        isLoading={isLoading}
        disabled={isLoading || !email}
        loadingText="Envoi en cours..."
      >
        Envoyer le lien de vérification
      </LoaderButton>

      <p className="text-sm text-gray-500 text-center">
        Le lien sera valable pendant 24 heures
      </p>
    </form>
  );
}
