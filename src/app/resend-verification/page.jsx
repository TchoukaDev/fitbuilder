// Page pour demander un nouveau lien de vérification
import { WelcomeLayout } from "@/Global/components";
import ResendVerificationClient from "./ResendVerificationClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ResendVerificationPage() {
  const session = await getServerSession(authOptions);

  // Redirection si déjà connecté
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <WelcomeLayout>
      <div className="flex flex-col justify-center items-center p-10 flex-2/3">
        <h1>Renvoyer l'email de vérification</h1>
        <p className="text-lg mb-5 text-center max-w-lg">
          Entrez votre adresse email pour recevoir un nouveau lien de
          vérification.
        </p>
        <ResendVerificationClient />
        <Link href="/" className="text-sm my-5 link">
          Retour à la connexion
        </Link>
      </div>
    </WelcomeLayout>
  );
}
