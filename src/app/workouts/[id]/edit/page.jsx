import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UpdatedWorkoutForm from "@/Features/Workouts/forms/UpdateWorkoutForm";
import Header from "@/Global/components/layout/Header";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils/getExercises";
import { getWorkoutById } from "@/Features/Workouts/utils/getWorkouts";
import { getServerSession } from "next-auth";

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
        <UpdatedWorkoutForm
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
