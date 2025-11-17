// app/sessions/page.jsx

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getAllSessions } from "@/utils/getSessions";
import Header from "@/components/Layout/Header/Header";
import SessionsList from "../Features/Sessions/SessionsList/SessionsList";

// ✅ Accepter les searchParams de Next.js
export default async function SessionPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // ✅ Extraire les filtres de l'URL (SSR)
  const status = searchParams?.status || "all";
  const dateFilter = searchParams?.dateFilter || "all";
  const page = parseInt(searchParams?.page) || 1;
  const limit = 20;

  // ✅ Fetch initial côté serveur avec filtres
  const initialData = await getAllSessions(userId, {
    status,
    dateFilter,
    page,
    limit,
  });

  // ✅ Sérialiser
  const serializedData = JSON.parse(JSON.stringify(initialData));

  return (
    <>
      <Header />
      <SessionsList
        initialData={serializedData}
        userId={userId}
        initialFilters={{
          status,
          dateFilter,
          page,
        }}
      />
    </>
  );
}

// ✅ Metadata dynamique pour SEO
export async function generateMetadata({ searchParams }) {
  const status = searchParams?.status;
  const dateFilter = searchParams?.dateFilter;

  let title = "Historique des séances";

  if (status && status !== "all") {
    const statusLabels = {
      completed: "terminées",
      "in-progress": "en cours",
      planned: "planifiées",
    };
    title = `Séances ${statusLabels[status]} | Historique`;
  }

  if (dateFilter && dateFilter !== "all") {
    const periodLabels = {
      week: "7 derniers jours",
      month: "30 derniers jours",
      quarter: "3 derniers mois",
      year: "dernière année",
    };
    title += ` - ${periodLabels[dateFilter]}`;
  }

  return {
    title,
    description: "Consulte l'historique complet de tes séances d'entraînement",
  };
}
