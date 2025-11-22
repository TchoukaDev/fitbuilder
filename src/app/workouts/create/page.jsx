import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/Global/components/layout/Header";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils/getExercises";
import { getServerSession } from "next-auth";
import NewWorkoutForm from "@/Features/Workouts/forms/NewWorkoutForm";

export const revalidate = 60;
export default async function CreateWorkoutPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;
  const exercises = (await getAllExercises(userId)) || [];
  const serializedExercises = JSON.parse(JSON.stringify(exercises));
  const favorites = (await getFavoritesExercises(userId)) || [];
  const serializedFavorites = JSON.parse(JSON.stringify(favorites));
  return (
    <>
      <Header />
      <main>
        <h1>Créer un nouvel entraînement</h1>
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
