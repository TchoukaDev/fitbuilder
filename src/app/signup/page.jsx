import Link from "next/link";
import { SignUpForm } from "@/Features/Auth/forms";
import { WelcomeLayout } from "@/Global/components";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function signUpPage() {
  const session = await getServerSession(authOptions);

  // Si utilisateur connecté, le renvoyer sur dashboard
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <WelcomeLayout>
      <div className="flex flex-col justify-center items-center p-10 flex-2/3">
        <h1>Inscription</h1>
        <p className="text-lg mb-5">
          Inscrivez-vous pour profiter pleinement de FitBuilder:
        </p>
        <SignUpForm />
        <Link href="/" className="text-sm my-5 link">
          Vous avez déjà un compte? Connectez-vous.
        </Link>
      </div>
    </WelcomeLayout>
  );
}
