import { Header } from "@/Global/components";
import CalendarComponent from "@/Features/Calendar/components/CalendarComponent/CalendarComponent";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { getPlannedSessions } from "@/Features/Sessions/utils";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const sessions = await getPlannedSessions(userId);
  const serializedSessions = JSON.parse(JSON.stringify(sessions));
  return (
    <>
      <Header />
      <main>
        <CalendarComponent
          userId={userId}
          initialSessions={serializedSessions}
        />
      </main>
    </>
  );
}
