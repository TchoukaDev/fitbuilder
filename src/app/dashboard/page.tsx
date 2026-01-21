// Page tableau de bord utilisateur

import { Header } from "@/Global/components";
import DashboardClient from "@/Features/Dashboard/components/DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

export default async function Dashboard({ searchParams }: { searchParams: { authError: string } }) {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!session || !userId) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const authError = resolvedSearchParams?.authError;

  return (
    <>
      <Header />
      <main>
        {authError === "forbidden" && (
          <p className="formError">Accès refusé. Page strictement réservée</p>
        )}
        <h1>📊 Dashboard</h1>
        <DashboardClient userId={userId} />
      </main>
    </>
  );
}
