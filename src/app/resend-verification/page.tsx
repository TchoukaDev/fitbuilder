// Page pour demander un nouveau lien de vérification
import { WelcomeLayout } from "@/Global/components";
import { ResendVerificationForm } from "@/Features/Auth/forms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

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

        <ResendVerificationForm />
      </div>
    </WelcomeLayout>
  );
}
