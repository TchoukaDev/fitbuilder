"use client";

import { useState } from "react";
import { LoaderButton, Label, Button } from "@/Global/components";
import { toast } from "react-toastify";
import Link from "next/link";
import { resendVerificationSchema } from "../utils";

export default function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    const validatedData = resendVerificationSchema.safeParse({ email });
    if (!validatedData.success) {
      setError(validatedData.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validatedData.data.email.toLowerCase() }),
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
          setError(data.error);
        } else {
          setError(data.error || "Une erreur est survenue");
        }
      }
    } catch (error) {
      console.error("Erreur renvoi email:", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
      setError(null);
    }
  };

  // Affichage après envoi réussi
  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 max-w-lg text-center mb-5">
        <p className="text-lg text-green-600 font-semibold">
          Email envoyé avec succès !
        </p>
        <p className="text-gray-600">
          Un nouveau lien de vérification a été envoyé à{" "}
          <strong>{email}</strong>. Consultez votre boîte mail (pensez à
          vérifier les spams).
        </p>
        <Button
          type="button"
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
        >
          Renvoyer à une autre adresse
        </Button>
      </div>
    );
  }

  // Formulaire de saisie
  return (
    <>
      <p className="text-lg mb-5 text-center max-w-lg">
        Entrez votre adresse email pour recevoir un nouveau lien de
        vérification.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-5"
      >
        {error && <p className="formError">{error}</p>}
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

        <p className="text-sm text-gray-500 text-center ">
          Le lien sera actif pendant 24 heures
        </p>

        <Button asChild close>
          <Link href="/">Retour à la connexion</Link>
        </Button>
      </form>
    </>
  );
}
