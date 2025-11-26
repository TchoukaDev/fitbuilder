// Page d'exécution d'une séance d'entraînement en cours
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getSessionbyId } from "@/Features/Sessions/utils";
import { notFound } from "next/navigation";
import { SessionExecution } from "@/Features/Sessions/components";

export default async function SingleSessionPage({ params }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Récupération de la séance
  const sessionData = await getSessionbyId(userId, sessionId);
  if (!sessionData) {
    return notFound();
  }

  const serializedSession = JSON.parse(JSON.stringify(sessionData));

  return (
    <SessionExecution
      key={sessionData._id}
      sessionData={serializedSession}
      userId={userId}
      sessionId={sessionId}
    />
  );
}
