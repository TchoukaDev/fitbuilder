import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getSessionbyId } from "@/utils/getSessions";
import { notFound } from "next/navigation";
import SessionExecution from "@/components/Features/Sessions/SessionExecution/SessionExecution";

export default async function SingleSessionPage({ params }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const sessionData = await getSessionbyId(userId, sessionId);
  if (!sessionData) {
    return notFound();
  }

  return <SessionExecution sessionData={sessionData} userId={userId} />;
}
