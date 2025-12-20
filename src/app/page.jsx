// Page d'accueil avec formulaire de connexion
import { LoginForm } from "@/Features/Auth/forms";
import Link from "next/link";
import { GoogleBtn } from "@/Features/Auth/components";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import { WelcomeLayout } from "@/Global/components";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && session.user && session.user.id) {
    redirect("/dashboard");
  }

  return (
    <WelcomeLayout>
      <div className="flex flex-col justify-center items-center pt-0 p-5 md:p-10 flex-2/3">
        <h1>Bienvenue sur FitBuilder</h1>
        <p className="text-lg my-5 max-w-2xl mx-auto">
          FitBuilder est l'appli qui vous permet de créer vos propres programmes
          de musculation et de gérer votre suivi sportif au quotidien.
        </p>
        <p className="text-lg mb-5">Pour commencer, connectez-vous:</p>

        {/* Formulaire de connexion */}
        <LoginForm />

        {/* Séparateur */}
        <div className="flex items-center w-full max-w-sm my-6">
          <div className="flex-1 border-t border-primary-300"></div>
          <span className="px-4 text-sm uppercase">ou</span>
          <div className="flex-1 border-t border-primary-300"></div>
        </div>

        {/* Connexion Google */}
        <GoogleBtn>Se connecter avec Google</GoogleBtn>

        <Link href="/signup" className="text-sm my-5 link">
          Vous n'avez pas encore de compte? Inscrivez-vous.
        </Link>
      </div>
    </WelcomeLayout>
  );
}
