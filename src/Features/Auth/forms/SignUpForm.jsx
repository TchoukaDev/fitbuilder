"use client";

// Formulaire d'inscription avec validation Zod et gestion d'erreurs client/serveur
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { Label, ShowPassword, LoaderButton } from "@/Global/components";
import { signUpSchema } from "../utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@/Global/hooks";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const usernameRef = useRef(null);
  const { signUp, serverErrors, clearServerError } = useSignUp();

  // React Hook Form avec validation Zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: clientErrors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const usernameRegister = register("username");

  const username = watch("username");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data) => {
    try {
      await signUp(data);
    } catch (error) {
      toast.error(error.error.message || "Erreur lors de l'inscription");
    }
  };

  // Focus automatique sur le champ username
  useEffect(() => {
    usernameRef?.current?.focus();
  }, []);

  return (
    <form
      className="gap-5 flex flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Champ nom d'utilisateur */}
      <div className="relative ">
        <input
          type="text"
          className="input peer"
          id="username"
          name="username"
          autoComplete="username"
          placeholder=""
          {...usernameRegister}
          ref={(e) => {
            usernameRegister.ref(e);
            usernameRef.current = e;
          }}
          onChange={(e) => {
            usernameRegister.onChange(e);
            clearServerError("username");
          }}
        />
        <Label htmlFor="username" value={username}>
          Nom d'utilisateur
        </Label>
      </div>
      {clientErrors?.username && (
        <p className="formError">{clientErrors.username.message}</p>
      )}
      {serverErrors?.username && !clientErrors.username && (
        <p className="formError">{serverErrors.username}</p>
      )}

      {/* Champ email */}
      <div className="relative">
        <input
          autoComplete="email"
          type="email"
          id="email"
          name="email"
          className="input peer"
          placeholder=""
          {...register("email", {
            onChange: () => clearServerError("email"),
          })}
        />
        <Label htmlFor="email" value={email}>
          Adresse email
        </Label>
      </div>
      {clientErrors?.email && (
        <p className="formError">{clientErrors.email.message}</p>
      )}
      {serverErrors?.email && !clientErrors.email && (
        <p className="formError">{serverErrors.email}</p>
      )}

      {/* Champ mot de passe */}
      <div className="relative">
        <input
          autoComplete="new-password"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          className="input peer"
          placeholder=""
          {...register("password", {
            onChange: () => clearServerError("password"),
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
      {clientErrors?.password && (
        <p className="formError">{clientErrors.password.message}</p>
      )}
      {serverErrors?.password && !clientErrors.password && (
        <p className="formError">{serverErrors.password}</p>
      )}

      {/* Champ confirmation mot de passe */}
      <div className="relative">
        <input
          autoComplete="new-password"
          type={showPassword2 ? "text" : "password"}
          id="confirmPassword"
          name="confirmPassword"
          className="input peer"
          placeholder=""
          {...register("confirmPassword", {
            onChange: () => clearServerError("confirmPassword"),
          })}
        />
        <Label htmlFor="confirmPassword" value={confirmPassword}>
          Confirmer le mot de passe
        </Label>
        <ShowPassword
          showPassword={showPassword2}
          onClick={() => setShowPassword2((prev) => !prev)}
        />
      </div>
      {clientErrors?.confirmPassword && (
        <p className="formError">{clientErrors.confirmPassword.message}</p>
      )}
      {serverErrors?.confirmPassword && !clientErrors.confirmPassword && (
        <p className="formError">{serverErrors.confirmPassword}</p>
      )}

      {/* Bouton de soumission */}
      <LoaderButton
        isLoading={isSubmitting}
        loadingText="Inscription en cours"
        type="submit"
        disabled={isSubmitting}
        label="S'inscrire"
      >
        S'inscrire
      </LoaderButton>
    </form>
  );
}
