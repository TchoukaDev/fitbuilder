// Page de création d'un nouveau plan d'entraînement
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils/getExercises";
import { getServerSession } from "next-auth";
import { Header } from "@/Global/components";
import { NewWorkoutForm } from "@/Features/Workouts/forms";

export const revalidate = 60;

export default async function CreateWorkoutPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  // Récupération des exercices et favoris
  const exercises = (await getAllExercises(userId)) || [];
  const serializedExercises = JSON.parse(JSON.stringify(exercises));
  const favorites = (await getFavoritesExercises(userId)) || [];
  const serializedFavorites = JSON.parse(JSON.stringify(favorites));

  return (
    <>
      <Header />
      <main>
        <h1>Créer un nouveau plan d'entraînement</h1>
        <NewWorkoutForm
          allExercises={serializedExercises}
          favorites={serializedFavorites}
          isAdmin={isAdmin}
          userId={userId}
        />
      </main>
    </>
  );
}
