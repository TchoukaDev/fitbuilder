"use client";

import { useEffect, useRef, useState } from "react";
import Label from "../Label/Label";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import Button from "../../Buttons/Button";
import Link from "next/link";
import ShowPassword from "../ShowPassword/ShowPassword";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // ✅ Ajouter
import { toast } from "react-toastify";

export default function LoginForm() {
  const router = useRouter(); // ✅ Ajouter
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(""); // ✅ Ajouter pour erreurs serveur

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors: clientsErrors, isSubmitting },
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { autoLogin: true },
  });

  const email = watch("email");
  const password = watch("password");

  const emailRegister = register("email", {
    required: "Veuillez saisir une adresse email valide",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Veuillez saisir une adresse email valide",
    },
  });

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef?.current?.focus();
  }, []);

  // ✅ CORRECTION ICI
  const onSubmit = async (data) => {
    setLoginError(""); // Réinitialiser l'erreur

    try {
      // 1️⃣ Tenter la connexion avec NextAuth
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        autoLogin: data.autoLogin.toString(),
        redirect: false,
      });

      // ✅ Succès
      if (result?.ok && !result?.error) {
        toast.success("Connexion réussie!");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // ❌ Échec : Récupérer le statut de l'utilisateur
      if (result?.error) {
        setLoginError(result.error);
        // Compte bloqué
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setLoginError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      reset();
    }
  };

  return (
    <form
      className="gap-5 flex flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Email */}
      <div className="relative">
        <input
          autoComplete="email"
          type="email"
          id="email"
          name="email"
          className="input peer"
          placeholder=""
          {...emailRegister}
          ref={(e) => {
            emailRegister.ref(e);
            emailRef.current = e;
          }}
        />
        <Label htmlFor="email" value={email}>
          Adresse email
        </Label>
      </div>
      {clientsErrors?.email && (
        <p className="formError">{clientsErrors.email.message}</p>
      )}

      {/* Mot de passe */}
      <div className="relative">
        <input
          autoComplete="current-password" // ✅ Meilleur autocomplete
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          className="input peer"
          placeholder=""
          {...register("password", {
            required: "Veuillez saisir votre mot de passe",
            validate: (value) =>
              value.trim() !== "" ||
              "Le mot de passe ne peut pas contenir uniquement des espaces",
          })}
        />
        <Label htmlFor="password" value={password}>
          Mot de passe
        </Label>
        <ShowPassword
          showPassword={showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
        />
      </div>
      {clientsErrors?.password && (
        <p className="formError">{clientsErrors.password.message}</p>
      )}

      {/* ✅ Afficher l'erreur serveur */}
      {loginError && <p className="formError">{loginError}</p>}

      <Link href="/forgot-password" className="text-xs -mt-3 link">
        Vous avez oublié votre mot de passe?
      </Link>

      <div className="flex flex-col justify-center items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span>Connexion en cours</span>
              <ClipLoader size={15} color="#e8e3ff" />
            </>
          ) : (
            "Se connecter"
          )}
        </Button>

        <div className="flex items-center justify-center gap-1">
          <label htmlFor="autoLogin" className="text-xs cursor-pointer">
            Se souvenir de moi
          </label>
          <input
            type="checkbox"
            className="cursor-pointer accent-primary-500"
            {...register("autoLogin")}
            id="autoLogin"
          />
        </div>
      </div>
    </form>
  );
}
