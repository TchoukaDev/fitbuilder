"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "react-toastify";


// Affiche une toast de succès après la connexion Google
 function AuthGoogleToastClient() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
    const pathname = usePathname();
    // Ref pour éviter le re-rendu de la toast
  const toastShown = useRef(false);

  // Gère la redirection après la connexion
  useEffect(() => {
    const authSuccess = searchParams.get("authSuccess");

    // Affiche la toast si la connexion est réussie et si la toast n'a pas été affichée
    if (session && authSuccess === "true" && !toastShown.current) {
      toast.success("Connexion réussie!");
      toastShown.current = true;

      // Nettoie l'URL
      const params = new URLSearchParams(searchParams);
      params.delete("authSuccess");
      const newUrl = params.toString() 
        ? `${pathname}?${params.toString()}` 
        : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [session, searchParams, router, pathname]);

  return null;
}

export default function AuthGoogleToast() {
  return <Suspense><AuthGoogleToastClient /></Suspense>;
}