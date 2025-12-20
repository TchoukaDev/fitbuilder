// Page de création d'un nouveau plan d'entraînement
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils/getExercises";
import { getServerSession } from "next-auth";
import { Header } from "@/Global/components";
import { NewWorkoutForm } from "@/Features/Workouts/forms";
import { WorkoutStoreProvider } from "@/Features/Workouts/store";
export const revalidate = 60;

export default async function CreateWorkoutPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // Récupération des exercices et favoris
  const exercises = (await getAllExercises(userId)) || [];
  const serializedExercises = JSON.parse(JSON.stringify(exercises));
  const favoritesExercises = (await getFavoritesExercises(userId)) || [];
  const serializedFavorites = JSON.parse(JSON.stringify(favoritesExercises));

  return (
    <>
      <Header />
      <main>
        <h1>📋 Créer un nouveau plan d'entraînement</h1>
        <WorkoutStoreProvider>
          <div className="p-6">
            <NewWorkoutForm
              allExercises={serializedExercises}
              favoritesExercises={serializedFavorites}
              isAdmin={isAdmin}
              userId={userId}
            />
          </div>
        </WorkoutStoreProvider>
      </main>
    </>
  );
}
