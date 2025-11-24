"use client";
import { useEffect } from "react";

export function useBlockScroll() {
  // Bloquer le scroll quand la modale est ouverte
  useEffect(() => {
    // Bloquer le scroll
    document.body.style.overflow = "hidden";

    // Réactiver le scroll quand la modale se ferme / composant détruit
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
}
