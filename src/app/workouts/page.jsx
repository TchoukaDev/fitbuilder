import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Layout/Header/Header";
import WorkoutTemplateList from "@/components/Workouts/WorkoutTemplatesList/WorkoutTemplateList";
import { getWorkouts } from "@/utils/getTemplates";
import { getServerSession } from "next-auth";

export const revalidate = 60;

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const templates = (await getWorkouts(userId)) || [];

  return (
    <>
      <Header />
      <main>
        <h1>Mes plans d'entraînement</h1>
        <WorkoutTemplateList initialTemplates={templates} userId={userId} />
      </main>
    </>
  );
}
