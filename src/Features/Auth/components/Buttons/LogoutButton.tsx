"use client";

// Bouton de déconnexion avec icône et tooltip
import { signOut } from "next-auth/react";
import { useState } from "react";
import { HiOutlineLogout } from "react-icons/hi";

export default function LogoutButton({ mobile, header }: { mobile?: boolean; header?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      setLoading(false);
    }
  };

  if (header) {
    return (
      <button
        title="Déconnexion"
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center justify-center h-11 w-11 text-primary-300 cursor-pointer"
      >
        <HiOutlineLogout className="size-6" />
      </button>
    );
  }

  if (mobile) {
    return (
      <button
        title="Déconnexion"
        onClick={handleLogout}
        disabled={loading}
        className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-0.5 px-2 text-primary-300 cursor-pointer"
      >
        <HiOutlineLogout className="size-6" />
        <span className="text-[10px] font-medium leading-none">Quitter</span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        title="Déconnexion"
        onClick={handleLogout}
        disabled={loading}
        className="text-primary-300 cursor-pointer flex items-center justify-end animatedRotation"
      >
        <HiOutlineLogout className="size-6 md:size-10" />
      </button>

      {/* Tooltip au survol */}
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:block font-semibold text-primary-300 text-xs left-1/2 -translate-x-1/2 mt-2">
        Déconnexion
      </div>
    </div>
  );
}
