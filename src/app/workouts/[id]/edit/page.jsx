import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { getWorkoutById } from "@/Features/Workouts/utils";
import { getServerSession } from "next-auth";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils";
import { Header } from "@/Global/components";
import { UpdateWorkoutForm } from "@/Features/Workouts/forms";

export default async function EditWorkout({ params }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const resolvedparams = await params;
  const workoutId = resolvedparams?.id;
  const allExercises = await getAllExercises(userId);
  const workout = await getWorkoutById(userId, workoutId);
  const favorites = await getFavoritesExercises(userId);

  return (
    <>
      <Header />
      <main>
        <h1>Modifier le plan d'entraînement "{workout.name}"</h1>
        <UpdateWorkoutForm
          workout={workout}
          isAdmin={isAdmin}
          userId={userId}
          allExercises={allExercises}
          favorites={favorites}
        />
      </main>
    </>
  );
}
