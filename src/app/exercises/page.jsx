import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ExercisesList from "@/Features/Exercises/ExercisesList/ExercisesList";
import { getAllExercises, getFavoritesExercises } from "@/utils/getExercises";
import Header from "@/components/Layout/Header/Header";

// ✅ Cache ISR de 60 secondes
export const revalidate = 60;

export default async function ExercisesPage() {
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
        <h1>Mes exercices</h1>
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
