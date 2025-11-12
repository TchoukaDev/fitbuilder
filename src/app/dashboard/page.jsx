import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Header from "../../components/Layout/Header/Header";

export default async function Dashboard({ searchParams }) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <>
      <Header />
      <main>
        {error === "access-denied" && (
          <p className="formError">Accès refusé. Page strictement réservée</p>
        )}
        <h1>Tableau de bord</h1>
      </main>
    </>
  );
}
