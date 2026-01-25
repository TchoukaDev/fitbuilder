import { Header } from "@/Global/components";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";
import { getEvents } from "@/Features/Calendar/utils";
import {
  CalendarLoader,
  CalendarComponent,
} from "@/Features/Calendar/components";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/")
  }
  const events = await getEvents(userId);
  const serializedEvents = JSON.parse(JSON.stringify(events));


  return (
    <>
      <Header />
      <main>
        <h1>📅 Planning d'entraînement</h1>
        <Suspense fallback={<CalendarLoader />}>
          <CalendarComponent userId={userId} initialEvents={serializedEvents} />
        </Suspense>
      </main>
    </>
  );
}
