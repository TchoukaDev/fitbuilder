import LogoutButton from "../../components/Buttons/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import PageLayout from "../../components/Layout/Header/Header";

export default async function Dashboard({ searchParams }) {
  const session = await getServerSession(authOptions);
  const error = searchParams?.error;
  console.log(error);
  return (
    <>
      <PageLayout />
      <main>
        {error === "access-denied" && (
          <p className="formError">Accès refusé. Page strictement réservée</p>
        )}
        <p>Hello {session?.user?.username}</p>
      </main>
    </>
  );
}
