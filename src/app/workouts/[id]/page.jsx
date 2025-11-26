// Page serveur qui affiche le détail d'un plan d'entraînement pour un utilisateur.
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { Header } from "@/Global/components";
import { getWorkoutById } from "@/Features/Workouts/utils";
import { WorkoutDetailPageClient } from "@/Features/Workouts/components";

export default async function WorkoutDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedparams = await params;
  const workoutId = resolvedparams.id;

  // TODO: Récupérer le workout depuis la DB
  const workout = await getWorkoutById(userId, workoutId);
  const serializedWorkout = JSON.parse(JSON.stringify(workout));
  if (!workout) {
    notFound();
  }

  return (
    <>
      <Header />
      <WorkoutDetailPageClient
        workout={serializedWorkout}
        workoutId={workoutId}
        userId={userId}
      />
    </>
  );
}
