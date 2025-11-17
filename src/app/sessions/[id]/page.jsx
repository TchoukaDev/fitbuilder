import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getSessionbyId } from "@/utils/getSessions";
import { notFound } from "next/navigation";
import SessionExecution from "@/app/Features/Sessions/SessionExecution/SessionExecution";

export default async function SingleSessionPage({ params }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const sessionData = await getSessionbyId(userId, sessionId);
  if (!sessionData) {
    return notFound();
  }

  // ✅ FORCER LA SÉRIALISATION EN JSON PUR
  const serializedSession = JSON.parse(JSON.stringify(sessionData));
  console.log(sessionData);
  console.log(serializedSession);
  return (
    <SessionExecution
      key={sessionData._id}
      sessionData={serializedSession}
      userId={userId}
      sessionId={sessionId}
    />
  );
}
