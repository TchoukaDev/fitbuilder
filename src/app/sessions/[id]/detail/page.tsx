// Page de détail d'une séance terminée avec récapitulatif
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { getSessionbyId } from "@/Features/Sessions/utils";
import { redirect } from "next/navigation";
import { SessionDetailClient } from "@/Features/Sessions/components";
import { Header } from "@/Global/components";
import { CompletedSessionType } from "@/types/workoutSession";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams?.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId || !sessionId) {
    redirect("/");
  }
  // Récupération de la séance
  const sessionData = await getSessionbyId(userId, sessionId);

  if (!sessionData) {
    redirect("/sessions");
  }

  // Redirection si la séance n'est pas terminée
  if (sessionData.status !== "completed") {
    redirect(`/sessions/${sessionId}`);
  }
  console.log(sessionData)
  const serializedSession = JSON.parse(JSON.stringify(sessionData));

  return (
    <>
      <Header />
      <main>
        <SessionDetailClient session={serializedSession} userId={userId} />
      </main>
    </>
  );
}

// Metadata dynamique pour SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      title: "Détail de la séance",
    };
  }

  const sessionData = await getSessionbyId(userId, sessionId) as CompletedSessionType | null;

  if (!sessionData) {
    return {
      title: "Séance introuvable",
    };
  }



  return {
    title: `${sessionData.workoutName} - Détail de la séance`,
    description: `Récapitulatif de la séance ${sessionData.workoutName
      } du ${new Date(sessionData.completedDate).toLocaleDateString("fr-FR")}`,
  };
}
