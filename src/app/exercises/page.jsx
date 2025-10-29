import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PageLayout from "@/components/Layout/Header/Header";
import ExercisesList from "@/components/ExercisesList/ExercisesList";
import { getAllExercises, getFavoritesExercises } from "@/utils/getExercises";

// ✅ Cache ISR de 60 secondes
export const revalidate = 60;

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }
  const exercises = await getAllExercises(userId);
  const favorites = await getFavoritesExercises(userId);

  return (
    <>
      <PageLayout />
      <main className="w-9/10 mx-auto">
        <h1>Mes exercices</h1>
        <ExercisesList
          isAdmin={isAdmin}
          initialExercises={exercises}
          initialFavorites={favorites}
        />
      </main>
    </>
  );
}
