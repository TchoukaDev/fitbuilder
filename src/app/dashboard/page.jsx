// Page tableau de bord utilisateur

import { Header } from "@/Global/components";
import DashboardClient from "@/Features/Dashboard/components/DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

export default async function Dashboard({ searchParams }) {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!session || !session.user?.id) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <>
      <Header />
      <main>
        {error === "access-denied" && (
          <p className="formError">Accès refusé. Page strictement réservée</p>
        )}
        <h1>📊 Dashboard</h1>
        <DashboardClient userId={userId} />
      </main>
    </>
  );
}
