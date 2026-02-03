// Page de vérification d'email
import { WelcomeLayout } from "@/Global/components";
import { VerifyEmailClient } from "@/Features/Auth/components";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const session = await getServerSession(authOptions);

  // Redirection si déjà connecté
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  // Récupération du token
  const resolvedParams = await searchParams;
  const token = resolvedParams?.token;

  return (
    <WelcomeLayout>
      <div className="flex flex-col justify-center items-center p-10 flex-2/3">
        <VerifyEmailClient token={token} />
      </div>
    </WelcomeLayout>
  );
}
