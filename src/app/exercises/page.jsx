// Page de liste de tous les exercices (publics + personnalisés + favoris)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ExercisesList } from "@/Features/Exercises/components";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils";
import { Header } from "@/Global/components";

export const revalidate = 60;

export default async function ExercisesPage() {
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
        <h1>📝 Mes exercices</h1>
        <ExercisesList
          initialExercises={serializedExercises}
          initialFavorites={serializedFavorites}
          isAdmin={isAdmin}
          userId={userId}
        />
      </main>
    </>
  );
}
