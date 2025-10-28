import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewExerciceForm from "../../components/Forms/newExerciceForm/newExerciceForm";
import connectDB from "@/libs/mongodb";
import PageLayout from "../../components/Layout/PageLayout/PageLayout";

export default async function Admin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard?error=access-denied");
  }

  return (
    <>
      <PageLayout />
      <main className="flex flex-col justify-center items-center ">
        <h1>Tableau admin</h1>
        <div className="flex gap-50">
          <div className="flex-col justify-center">
            <h2>Ajouter un nouvel exercice</h2>
            <NewExerciceForm />
          </div>
          <div>
            <h2>Afficher tous les exercices</h2>
            <div className="flex gap-20">
              <select></select>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
