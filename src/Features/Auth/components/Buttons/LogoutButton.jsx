"use client";

// Bouton de déconnexion avec icône et tooltip
import { signOut } from "next-auth/react";
import { useState } from "react";
import { HiOutlineLogout } from "react-icons/hi";

export default function LogoutButton() {
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

  return (
    <div className="relative group">
      <button
        title="Déconnexion"
        onClick={handleLogout}
        disabled={loading}
        className=" text-primary-300 cursor-pointer  animatedRotation"
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
