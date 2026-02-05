// Page de modification d'un plan d'entraînement existant
import { authOptions } from "@/libs/auth";
import { getWorkoutById } from "@/Features/Workouts/utils";
import { getServerSession } from "next-auth";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils";
import { UpdateWorkoutForm } from "@/Features/Workouts/forms";
import { WorkoutStoreProvider } from "@/Features/Workouts/store";
import { notFound, redirect } from "next/navigation";

export default async function EditWorkout({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/");
  }
  const isAdmin = session?.user?.role === "ADMIN";
  const resolvedparams = await params;
  const workoutId = resolvedparams?.id;


  // Récupération des données
  const allExercises = await getAllExercises(userId);
  const workout = await getWorkoutById(userId, workoutId);
  const favoritesExercises = await getFavoritesExercises(userId);

  if (!workout) {
    notFound()
  }

  return (
    <>
      <h1>📋 Modifier le plan d'entraînement "{workout.name}"</h1>
      <WorkoutStoreProvider key="updateWorkout" autoSave={false}>
        <div className="p-6">
          <UpdateWorkoutForm
            workout={workout}
            isAdmin={isAdmin}
            userId={userId}
            allExercises={allExercises}
            favoritesExercises={favoritesExercises}
          />
        </div>
      </WorkoutStoreProvider>
    </>
  );
}
