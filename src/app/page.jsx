// Page d'accueil avec formulaire de connexion
import { LoginForm } from "@/Features/Auth/forms";
import Link from "next/link";
import { GoogleBtn } from "@/Features/Auth/components";
import { WelcomeLayout } from "@/Global/components";

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const authError = resolvedSearchParams?.authError;
  const callbackUrl = resolvedSearchParams?.callbackUrl;
  return (
    <WelcomeLayout>
      <div className="flex flex-col justify-center items-center pt-0 p-5 md:p-10 flex-2/3">
        <h1>Bienvenue sur FitBuilder</h1>
        <p className="text-lg my-5 max-w-2xl mx-auto">
          FitBuilder est l'appli qui vous permet de créer vos propres programmes
          de musculation et de gérer votre suivi sportif au quotidien.
        </p>
        <p className="text-lg mb-5">Pour commencer, connectez-vous:</p>

        {authError && (
          <p className="formError mb-5">
            Vous devez être connecté pour accéder à cette page
          </p>
        )}

        {/* Formulaire de connexion */}
        <LoginForm callbackUrl={callbackUrl} />

        {/* Séparateur */}
        <div className="flex items-center w-full max-w-sm my-6">
          <div className="flex-1 border-t border-primary-300"></div>
          <span className="px-4 text-sm uppercase">ou</span>
          <div className="flex-1 border-t border-primary-300"></div>
        </div>

        {/* Connexion Google */}
        <GoogleBtn callbackUrl={callbackUrl}>
          Se connecter avec Google
        </GoogleBtn>

        <Link href="/signup" className="text-sm my-5 link">
          Vous n'avez pas encore de compte? Inscrivez-vous.
        </Link>
      </div>
    </WelcomeLayout>
  );
}
