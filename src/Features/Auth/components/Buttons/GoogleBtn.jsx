"use client";

// Bouton de connexion avec Google OAuth
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export default function GoogleBtn({ children, callbackUrl }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: callbackUrl ? `${callbackUrl}?authSuccess=true` : "/dashboard?authSuccess=true",
      });

      if (result?.error) {
        toast.error("Erreur lors de la connexion avec Google");
        setLoading(false);
        return;
      }

    } catch (error) {
      toast.error("Une erreur inattendue est survenue");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center text-sm gap-2 rounded bg-white border hover:cursor-pointer border-primary-300 hover:border-blue-600 hover:bg-primary-50  shadow px-4 py-2 transition-all duration-300"
    >
      {loading ? (
        <ClipLoader color="#7557ff" size={16} />
      ) : (
        <FcGoogle size={20} />
      )}
      <span className="text-black">
        {loading ? "Connexion en cours..." : children}
      </span>
    </button>
  );
}
