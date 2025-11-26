// Page de liste des séances avec filtres et pagination
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SessionsList } from "@/Features/Sessions/components";
import { Header } from "@/Global/components";
import { getAllSessions } from "@/Features/Sessions/utils";

export default async function SessionsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Extraction des filtres depuis l'URL
  const status = resolvedSearchParams?.status || "all";
  const dateFilter = resolvedSearchParams?.dateFilter || "all";
  const templateFilter = resolvedSearchParams?.templateFilter || "all";
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const limit = 5;

  // Récupération des données initiales
  const initialData = await getAllSessions(userId, {});
  const serializedData = JSON.parse(JSON.stringify(initialData));

  return (
    <>
      <Header />
      <SessionsList
        initialSessions={serializedData}
        userId={userId}
        initialFilters={{
          status,
          dateFilter,
          templateFilter,
          page,
          limit,
        }}
      />
    </>
  );
}

// Metadata dynamique pour SEO
export async function generateMetadata({ searchParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const data = await getAllSessions(userId, {});
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams?.status;
  const dateFilter = resolvedSearchParams?.dateFilter;
  const templateFilter = resolvedSearchParams?.templateFilter;

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

  if (templateFilter && templateFilter !== "all") {
    const templateSet = new Set();
    data?.sessions.forEach((s) => templateSet.add(s.templateName));

    const templateLabels = {
      ...[...templateSet].map(
        (s) =>
          ({
            templateFilter,
          } || {}),
      ),
    };
    title += ` - ${templateLabels[templateFilter]}`;
  }

  return {
    title,
    description: "Consulte l'historique complet de tes séances d'entraînement",
  };
}
