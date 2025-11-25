import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import WorkoutTemplateList from "@/Features/Workouts/components/WorkoutTemplatesList/WorkoutTemplateList";
import { getWorkouts } from "@/Features/Workouts/utils";
import { Header } from "@/Global/components";
import { getServerSession } from "next-auth";

export const revalidate = 60;

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const templates = (await getWorkouts(userId)) || [];
  const serializedTemplates = JSON.parse(JSON.stringify(templates));
  const count = templates?.length;

  return (
    <>
      <Header />
      <main>
        <h1>Mes plans d'entraînement ({count})</h1>
        <WorkoutTemplateList
          initialTemplates={serializedTemplates}
          userId={userId}
        />
      </main>
    </>
  );
}
