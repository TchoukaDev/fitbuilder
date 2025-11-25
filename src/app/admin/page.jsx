import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Header } from "@/Global/components";

export default async function Admin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard?error=access-denied");
  }

  return (
    <>
      <Header />
      <main>
        <h1>Tableau admin</h1>
      </main>
    </>
  );
}
