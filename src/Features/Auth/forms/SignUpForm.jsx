"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { Button, Label, ShowPassword } from "@/Global/components";
import { ClipLoader } from "react-spinners";
import { signUpSchema } from "../utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@/Global/hooks";

export default function SignUpForm() {
  // ═══════════════════════════════════════════════════════
  // 📊 STATE
  // ═══════════════════════════════════════════════════════
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // ═══════════════════════════════════════════════════════
  // 🔧 HOOKS
  // ═══════════════════════════════════════════════════════
  const usernameRef = useRef(null);
  const { signUp, serverErrors, globalError, clearServerError } = useSignUp();

  // React Hook Form
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

  // Watch values
  const username = watch("username");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // ═══════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════

  // ✅ Fonction de soumission
  const onSubmit = async (data) => {
    await signUp(data);
  };
  // ═══════════════════════════════════════════════════════
  // 🔄 EFFECTS
  // ═══════════════════════════════════════════════════════
  console.log(serverErrors);
  // Focus au chargement
  useEffect(() => {
    usernameRef?.current?.focus();
  }, []);

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <form
      className="gap-5 flex flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* ✅ Erreur globale serveur */}
      {globalError && Object.keys(serverErrors).length === 0 && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {globalError}
        </div>
      )}

      {/* ─────────────────────────────────────────────────── */}
      {/* NOM D'UTILISATEUR */}
      {/* ─────────────────────────────────────────────────── */}
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
            usernameRegister.onChange(e); // ✅ RHF onChange
            clearServerError("username"); // ✅ Effacer erreur serveur
          }}
        />
        <Label htmlFor="username" value={username}>
          Nom d'utilisateur
        </Label>
      </div>

      {/* Erreurs */}
      {clientErrors?.username && (
        <p className="formError">{clientErrors.username.message}</p>
      )}
      {serverErrors?.username && !clientErrors.username && (
        <p className="formError">{serverErrors.username}</p>
      )}

      {/* ─────────────────────────────────────────────────── */}
      {/* EMAIL */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="relative">
        <input
          autoComplete="email"
          type="email"
          id="email"
          name="email"
          className="input peer"
          placeholder=""
          {...register("email", {
            onChange: () => clearServerError("email"), // ✅ Effacer erreur serveur
          })}
        />
        <Label htmlFor="email" value={email}>
          Adresse email
        </Label>
      </div>

      {/* Erreurs */}
      {clientErrors?.email && (
        <p className="formError">{clientErrors.email.message}</p>
      )}
      {serverErrors?.email && !clientErrors.email && (
        <p className="formError">{serverErrors.email}</p>
      )}

      {/* ─────────────────────────────────────────────────── */}
      {/* MOT DE PASSE */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="relative">
        <input
          autoComplete="new-password"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          className="input peer"
          placeholder=""
          {...register("password", {
            onChange: () => clearServerError("password"), // ✅ Effacer erreur serveur
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

      {/* Erreurs */}
      {clientErrors?.password && (
        <p className="formError">{clientErrors.password.message}</p>
      )}
      {serverErrors?.password && !clientErrors.password && (
        <p className="formError">{serverErrors.password}</p>
      )}

      {/* ─────────────────────────────────────────────────── */}
      {/* CONFIRMATION MOT DE PASSE */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="relative">
        <input
          autoComplete="new-password"
          type={showPassword2 ? "text" : "password"}
          id="confirmPassword"
          name="confirmPassword"
          className="input peer"
          placeholder=""
          {...register("confirmPassword", {
            onChange: () => clearServerError("confirmPassword"), // ✅ Effacer erreur serveur
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

      {/* Erreurs */}
      {clientErrors?.confirmPassword && (
        <p className="formError">{clientErrors.confirmPassword.message}</p>
      )}
      {serverErrors?.confirmPassword && !clientErrors.confirmPassword && (
        <p className="formError">{serverErrors.confirmPassword}</p>
      )}

      {/* ─────────────────────────────────────────────────── */}
      {/* BOUTON SUBMIT */}
      {/* ─────────────────────────────────────────────────── */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span>Inscription en cours</span>
            <ClipLoader size={15} color="#e8e3ff" />
          </>
        ) : (
          "S'inscrire"
        )}
      </Button>
    </form>
  );
}
