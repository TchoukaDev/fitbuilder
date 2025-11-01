import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Layout/Header/Header";
import WorkoutTemplateList from "@/components/Workouts/WorkoutTemplatesList/WorkoutTemplateList";
import { getAllTemplates } from "@/utils/getTemplates";
import { getServerSession } from "next-auth";

export const revalidate = 60;

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
  const templates = (await getAllTemplates(userId)) || [];

  return (
    <>
      <Header />
      <main>
        <h1>Mes plans d'entraînement</h1>
        <WorkoutTemplateList isAdmin={isAdmin} initialTemplates={templates} />
      </main>
    </>
  );
}
