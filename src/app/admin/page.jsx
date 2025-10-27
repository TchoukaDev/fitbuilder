import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewExerciceForm from "../components/Forms/newExerciceForm/newExerciceForm";

export default async function Admin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard?error=access-denied");
  }
  return (
    <main className="flex flex-col justify-center items-center ">
      <h1>Tableau admin</h1>
      <h2>Ajouter un nouvel exercice</h2>
      <NewExerciceForm />
    </main>
  );
}
