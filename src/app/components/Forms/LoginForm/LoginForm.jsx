"use client";

import { useEffect, useRef, useState } from "react";
import Label from "../Label/Label";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import Button from "../../Button/Button";
import Link from "next/link";
import ShowPassword from "../ShowPassword/ShowPassword";

export default function LoginForm() {
  // State pour afficher/cacher mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // RHF
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors: clientsErrors, isSubmitting },
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { autoLogin: true },
  });

  // Variables
  const email = watch("email");
  const password = watch("password");

  // Décomposition register email pour utilisation de useRef
  const emailRegister = register("email", {
    required: "Veuillez saisir une adresse email valide",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Veuillez saisir une adresse email valide",
    },
  });

  // Référence pour input Email pour focus
  const emailRef = useRef(null);

  // Focus au render
  useEffect(() => {
    emailRef?.current?.focus();
  }, []);

  // Gestion envoi du formulaire
  const onSubmit = () => {
    console.log("hello");
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
        {/* Label animé */}
        <Label htmlFor="email" value={email}>
          Adresse email
        </Label>
      </div>
      {/* Erreurs */}
      {clientsErrors?.email && (
        <p className="formError">{clientsErrors.email.message}</p>
      )}
      {/* Mot de passe */}
      <div className="relative">
        <input
          autoComplete="password"
          type={`${showPassword ? "text" : "password"}`}
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
        {/* Label animé */}
        <Label htmlFor="password" value={password}>
          Mot de passe
        </Label>
        {/* Show password */}
        <ShowPassword
          showPassword={showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
        />
      </div>{" "}
      {clientsErrors?.password && (
        <p className="formError">{clientsErrors.password.message}</p>
      )}
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
        </div>{" "}
      </div>
    </form>
  );
}
