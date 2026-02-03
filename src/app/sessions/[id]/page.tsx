// Page d'exécution d'une séance d'entraînement en cours
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { getSessionbyId } from "@/Features/Sessions/utils";
import { notFound, redirect } from "next/navigation";
import { SessionExecution } from "@/Features/Sessions/components";


export default async function SingleSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams?.id;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }

  // Récupération de la séance
  const sessionData = await getSessionbyId(userId, sessionId);
  if (!sessionData) {
    return notFound();
  }

  // Redirection si la séance est terminée
  if (sessionData.status === "completed") {
    redirect(`/sessions/${sessionId}/detail`);
  }


  return (
    <SessionExecution
      key={sessionData.id}
      sessionData={sessionData}
      userId={userId}
      sessionId={sessionId}
    />
  );
}
