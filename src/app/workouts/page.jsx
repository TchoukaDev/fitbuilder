// Page de liste des plans d'entraînement
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import WorkoutTemplateList from "@/Features/Workouts/components/WorkoutTemplatesList/WorkoutTemplateList";
import { getWorkouts } from "@/Features/Workouts/utils";
import { Header } from "@/Global/components";
import { getServerSession } from "next-auth";

export const revalidate = 60;

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Récupération des plans d'entraînement
  const templates = (await getWorkouts(userId)) || [];
  const serializedTemplates = JSON.parse(JSON.stringify(templates));

  return (
    <>
      <Header />
      <main>
        <WorkoutTemplateList
          initialTemplates={serializedTemplates}
          userId={userId}
        />
      </main>
    </>
  );
}
