// components/LogoutButton.jsx
"use client";

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
    <button
      title="Déconnexion"
      onClick={handleLogout}
      disabled={loading}
      className="shadow border border-primary-500 rounded-full text-primary-500 cursor-pointer p-2 hover:scale-110 animatedRotation transition-all"
    >
      <HiOutlineLogout className="size-6 md:size-10" />
    </button>
  );
}
