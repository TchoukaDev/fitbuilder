import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UpdatedWorkoutForm from "@/components/Forms/Workouts/UpdateWorkoutForm/UpdateWorkoutForm";
import Header from "@/components/Layout/Header/Header";
import { getAllExercises, getFavoritesExercises } from "@/utils/getExercises";
import { getWorkoutById } from "@/utils/getWorkouts";
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
