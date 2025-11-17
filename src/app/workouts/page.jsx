import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Layout/Header/Header";
import WorkoutTemplateList from "@/app/Features/Workouts/WorkoutTemplatesList/WorkoutTemplateList";
import { getWorkouts } from "@/utils/getWorkouts";
import { getServerSession } from "next-auth";

export const revalidate = 60;

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const templates = (await getWorkouts(userId)) || [];
  const serializedTemplates = JSON.parse(JSON.stringify(templates));

  return (
    <>
      <Header />
      <main>
        <h1>Mes plans d'entraînement</h1>
        <WorkoutTemplateList
          initialTemplates={serializedTemplates}
          userId={userId}
        />
      </main>
    </>
  );
}
