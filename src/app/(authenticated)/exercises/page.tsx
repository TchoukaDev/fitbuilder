// Page de liste de tous les exercices (publics + personnalisés + favoris)
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { ExercisesList } from "@/Features/Exercises/components";
import {
  getAllExercises,
  getFavoritesExercises,
} from "@/Features/Exercises/utils";
import { redirect } from "next/navigation";

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/");
  }

  // Récupération des exercices et favoris
  const exercises = (await getAllExercises(userId)) || [];
  const favoritesExercises = (await getFavoritesExercises(userId)) || [];

  return (
    <>
      <h1>📝 Mes exercices</h1>
      <ExercisesList
        initialExercises={exercises}
        initialFavorites={favoritesExercises}
        isAdmin={isAdmin}
        userId={userId}
      />
    </>
  );
}
