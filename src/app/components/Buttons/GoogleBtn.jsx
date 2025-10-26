"use client";

import { FcGoogle } from "react-icons/fc"; //icône Google
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function GoogleBtn({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        toast.error("Erreur lors de la connexion avec Google"); // ✅ Toast erreur
        setLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success("Connexion réussie !"); // ✅ Toast succès
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Une erreur inattendue est survenue");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center text-sm gap-2 rounded-3xl bg-white border hover:cursor-pointer border-gray-300 hover:border-blue-600 hover:bg-gray-300  shadow px-4 py-2 transition-all duration-300"
    >
      <FcGoogle size={20} />
      <span className="text-black">{children}</span>
    </button>
  );
}
