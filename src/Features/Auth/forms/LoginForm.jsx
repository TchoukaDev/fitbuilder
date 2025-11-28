"use client";

// Formulaire de connexion avec validation et gestion d'erreurs
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Label, ShowPassword, LoaderButton } from "@/Global/components";
import { loginSchema } from "../utils";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form avec validation Zod
  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors: clientsErrors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { autoLogin: true },
  });

  const email = watch("email");
  const password = watch("password");

  // Configuration du champ email avec validation
  const emailRegister = register("email", {
    required: "Veuillez saisir une adresse email valide",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Veuillez saisir une adresse email valide",
    },
  });

  const emailRef = useRef(null);

  // Focus automatique sur le champ email
  useEffect(() => {
    emailRef?.current?.focus();
  }, []);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        autoLogin: data.autoLogin.toString(),
        redirect: false,
      });

      // Connexion réussie
      if (result?.ok && !result?.error) {
        toast.success("Connexion réussie!");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Échec de connexion
      if (result?.error) {
        toast.error(result?.error || "Erreur lors de la connexion");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error(error?.message || "Erreur lors de la connexion");
    } finally {
      reset();
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

      {/* Champ mot de passe */}
      <div className="relative">
        <input
          autoComplete="current-password"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
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
      {clientsErrors?.password && (
        <p className="formError">{clientsErrors.password.message}</p>
      )}

      <Link href="/forgot-password" className="text-xs -mt-3 link">
        Vous avez oublié votre mot de passe?
      </Link>

      {/* Bouton de soumission */}
      <div className="flex flex-col justify-center items-center gap-2">
        <LoaderButton
          isLoading={isSubmitting}
          loadingText="Connexion en cours"
          type="submit"
          disabled={isSubmitting}
          label="Se connecter"
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
