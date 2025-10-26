// components/LogoutButton.jsx
"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton({ className = "" }) {
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
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
    >
      <FaSignOutAlt />
      {loading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
