// Page de détail d'une séance terminée avec récapitulatif
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSessionbyId } from "@/Features/Sessions/utils";
import { redirect } from "next/navigation";
import { SessionDetailClient } from "@/Features/Sessions/components";
import { Header } from "@/Global/components";

export default async function SessionDetailPage({ params }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Récupération de la séance
  const sessionData = await getSessionbyId(userId, sessionId);

  if (!sessionData) {
    redirect("/sessions");
  }

  // Redirection si la séance n'est pas terminée
  if (sessionData.status !== "completed") {
    redirect(`/sessions/${sessionId}`);
  }

  const serializedSession = JSON.parse(JSON.stringify(sessionData));

  return (
    <>
      <Header />
      <SessionDetailClient session={serializedSession} userId={userId} />
    </>
  );
}

// Metadata dynamique pour SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      title: "Détail de la séance",
    };
  }

  const sessionData = await getSessionbyId(userId, sessionId);

  if (!sessionData) {
    return {
      title: "Séance introuvable",
    };
  }

  return {
    title: `${sessionData.templateName} - Détail de la séance`,
    description: `Récapitulatif de la séance ${
      sessionData.templateName
    } du ${new Date(sessionData.completedDate).toLocaleDateString("fr-FR")}`,
  };
}
