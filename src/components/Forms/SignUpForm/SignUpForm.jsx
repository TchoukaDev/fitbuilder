"use client";
import { useForm } from "react-hook-form";
import Label from "../FormsComponents/Label/Label";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import ShowPassword from "../FormsComponents/ShowPassword/ShowPassword";
import Button from "@/components/Buttons/Button";
import { ClipLoader } from "react-spinners";
import { signUpSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser } from "@/actions/createUser";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function SignUpForm() {
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // RHF
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: clientsErrors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [serverState, formAction, isPending] = useActionState(createUser, null);

  const usernameRegister = register("username", {
    required: "Veuillez choisir un nom d'utilisateur",
    maxLength: {
      value: 20,
      message: "Votre nom d'utilisateur ne peut excéder 20 caractères",
    },
  });

  // Variables
  const router = useRouter();
  const username = watch("username");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const usernameRef = useRef(null);

  // Gestion du formulaire
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    startTransition(() => {
      formAction(formData);
    });
  };

  // Focus au chargement
  useEffect(() => {
    usernameRef?.current.focus();
  }, []);

  // Message + redirection après success
  useEffect(() => {
    if (serverState?.success) {
      toast.success(serverState.message);
      router.push("/");
    }
  }, [serverState?.success]);
  return (
    <form
      className="gap-5 flex flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Nom d'utilisateur */}
      <div className="relative">
        <input
          type="text"
          className="input peer"
          id="username"
          name="username"
          autoComplete="username"
          placeholder=""
          {...usernameRegister}
          ref={(e) => {
            usernameRegister.ref(e), (usernameRef.current = e);
          }}
        />
        <Label htmlFor="username" value={username}>
          Nom d'utilisateur
        </Label>
      </div>
      {/* Erreurs */}
      {clientsErrors?.username && (
        <p className="formError">{clientsErrors.username.message}</p>
      )}
      {serverState?.fieldErrors?.username && !clientsErrors.username && (
        <p className="formError">{serverState.fieldErrors.username}</p>
      )}
      {/* Email */}
      <div className="relative">
        <input
          autoComplete="email"
          type="email"
          id="email"
          name="email"
          className="input peer"
          placeholder=""
          {...register("email")}
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
      {serverState?.fieldErrors?.email && !clientsErrors.email && (
        <p className="formError">{serverState.fieldErrors.email}</p>
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
      </div>
      {/* Erreurs */}
      {clientsErrors?.password && (
        <p className="formError">{clientsErrors.password.message}</p>
      )}
      {serverState?.fieldErrors?.password && !clientsErrors.password && (
        <p className="formError">{serverState.fieldErrors.password}</p>
      )}
      {/* Confirmation du mot de passe */}
      <div className="relative">
        <input
          autoComplete="password"
          type={`${showPassword2 ? "text" : "password"}`}
          id="confirmPassword"
          name="confirmPassword"
          className="input peer"
          placeholder=""
          {...register("confirmPassword", {
            required: "Veuillez confirmer votre mot de passe",
          })}
        />
        {/* Label animé */}
        <Label htmlFor="confirmPassword" value={confirmPassword}>
          Mot de passe
        </Label>
        {/* Show password */}
        <ShowPassword
          showPassword={showPassword2}
          onClick={() => setShowPassword2((prev) => !prev)}
        />
      </div>
      {/* Erreurs */}
      {clientsErrors?.confirmPassword && (
        <p className="formError">{clientsErrors.confirmPassword.message}</p>
      )}
      {serverState?.fieldErrors?.confirmPassword &&
        !clientsErrors.confirmPassword && (
          <p className="formError">{serverState.fieldErrors.confirmPassword}</p>
        )}

      {/* Erreur serveur générale */}
      {serverState?.error && !serverState?.fieldErrors && (
        <div className="formError">{serverState.error}</div>
      )}

      <Button type="submit" disabled={isPending || isSubmitting}>
        {isPending || isSubmitting ? (
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
