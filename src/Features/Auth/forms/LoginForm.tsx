"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Label, ShowPassword, LoaderButton } from "@/Global/components";
import { loginSchema, LoginSchemaTypeInput } from "../utils";

export default function LoginForm({ callbackUrl = "/dashboard" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaTypeInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { autoLogin: true },
  });

  const email = watch("email");
  const password = watch("password");
  const emailRegister = register("email");

  // Focus auto sur email au montage
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const onSubmit = async (data: LoginSchemaTypeInput) => {
    // Reset l'état d'erreur email
    setEmailNotVerified(false);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        autoLogin: data.autoLogin ? data.autoLogin.toString() : "true",
        redirect: false,
      });

      // Connexion réussie
      if (result?.ok && !result?.error) {
        toast.success("Connexion réussie!");
        router.push(callbackUrl);
        router.refresh(); // Force le rafraîchissement de la session
        return;
      }

      // Échec de connexion
      if (result?.error) {
        // Détecte si c'est une erreur d'email non vérifié
        const isEmailError =
          result.error.toLowerCase().includes("vérifier") &&
          result.error.toLowerCase().includes("email");

        setEmailNotVerified(isEmailError);
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <form
      className="gap-5 flex flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Champ email */}
      <div className="relative">
        <input
          autoComplete="email"
          type="email"
          id="email"
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
      {errors?.email && <p className="formError">{errors.email.message}</p>}

      {/* Champ mot de passe */}
      <div className="relative">
        <input
          autoComplete="current-password"
          type={showPassword ? "text" : "password"}
          id="password"
          className="input peer"
          placeholder=""
          {...register("password")}
        />
        <Label htmlFor="password" value={password}>
          Mot de passe
        </Label>
        <ShowPassword
          showPassword={showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
        />
      </div>
      {errors?.password && (
        <p className="formError">{errors.password.message}</p>
      )}

      <Link href="/forgot-password" className="text-xs -mt-3 link">
        Vous avez oublié votre mot de passe?
      </Link>

      {/* Message email non vérifié */}
      {emailNotVerified && (
        <div className="formError text-center">
          <p className="font-semibold mb-2">Email non vérifié</p>
          <p className="mb-2">
            Vous devez vérifier votre adresse email avant de vous connecter.
          </p>
          <Link
            href="/resend-verification"
            className="text-accent-800 font-semibold underline hover:text-accent-900"
          >
            Demander un nouveau lien de vérification
          </Link>
        </div>
      )}

      {/* Bouton de soumission */}
      <div className="flex flex-col justify-center items-center gap-2">
        <LoaderButton
          isLoading={isSubmitting}
          loadingText="Connexion en cours"
          type="submit"
          disabled={isSubmitting}
        >
          Se connecter
        </LoaderButton>

        {/* Checkbox "Se souvenir de moi" */}
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
