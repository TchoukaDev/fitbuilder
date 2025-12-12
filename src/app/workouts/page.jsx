// Page de liste des plans d'entraînement
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { WorkoutList } from "@/Features/Workouts/components";
import { getWorkouts } from "@/Features/Workouts/utils";
import { Header } from "@/Global/components";
import { getServerSession } from "next-auth";

export const revalidate = 60;

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Récupération des plans d'entraînement
  const workouts = (await getWorkouts(userId)) || [];
  const serializedWorkouts = JSON.parse(JSON.stringify(workouts));

  return (
    <>
      <Header />
      <main>
        <WorkoutList initialWorkouts={serializedWorkouts} userId={userId} />
      </main>
    </>
  );
}
