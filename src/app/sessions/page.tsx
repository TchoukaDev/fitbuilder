// Page de liste des séances avec filtres et pagination
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { SessionsList } from "@/Features/Sessions/components";
import { Header } from "@/Global/components";
import { getAllSessions } from "@/Features/Sessions/utils";
import { DEFAULT_SESSION_FILTERS } from "@/Features/Sessions/utils/sessionFilters";
import { redirect } from "next/navigation";
import { Metadata } from "next";


type SearchParamsProps = Record<string, string>;

export default async function SessionsPage({ searchParams }: { searchParams: Promise<SearchParamsProps> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/")
  }

  // Extraction des filtres depuis l'URL
  const status = resolvedSearchParams?.status || DEFAULT_SESSION_FILTERS.status;
  const dateFilter = resolvedSearchParams?.dateFilter || DEFAULT_SESSION_FILTERS.dateFilter;
  const workoutFilter = resolvedSearchParams?.workoutFilter || DEFAULT_SESSION_FILTERS.workoutFilter;
  const page = parseInt(resolvedSearchParams?.page) || DEFAULT_SESSION_FILTERS.page;
  const limit = parseInt(resolvedSearchParams?.limit) || DEFAULT_SESSION_FILTERS.limit;

  // Récupération des données initiales
  const initialData = await getAllSessions(userId, {
    status,
    dateFilter,
    workoutFilter,
    page,
    limit,
  });

  const serializedData = JSON.parse(JSON.stringify(initialData));

  return (
    <>
      <Header />
      <main>
        <h1>📈 Suivi des séances</h1>
        <div className="p-6">
          <SessionsList
            initialSessions={serializedData}
            userId={userId}
            initialFilters={{
              status,
              dateFilter,
              workoutFilter,
              page,
              limit,
            }}
          />
        </div>
      </main>
    </>
  );
}

// Metadata dynamique pour SEO
export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParamsProps> }): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      title: "Séances",
      description: "Consulte l'historique complet de tes séances d'entraînement",
    };
  }

  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams?.status;
  const dateFilter = resolvedSearchParams?.dateFilter;
  const workoutFilter = resolvedSearchParams?.workoutFilter;

  let title = "Historique des séances";

  if (status && status !== "all") {
    const statusLabels = {
      completed: "terminées",
      "in-progress": "en cours",
      planned: "planifiées",
    };
    title = `Séances ${statusLabels[status as keyof typeof statusLabels]} | Historique`;
  }

  if (dateFilter && dateFilter !== "all") {
    const periodLabels = {
      week: "7 derniers jours",
      month: "30 derniers jours",
      quarter: "3 derniers mois",
      year: "dernière année",
    };
    title += ` - ${periodLabels[dateFilter as keyof typeof periodLabels]}`;
  }

  // Filtre par workout
  if (workoutFilter && workoutFilter !== "all") title += ` - ${workoutFilter}`;

  return {
    title,
    description: "Consulte l'historique complet de tes séances d'entraînement",
  };
}
