import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Layout/Header/Header";
import WorkoutTemplateForm from "@/components/Forms/WorkoutTemplateForm/WorkoutTemplateForm";
import { useCreateWorkout } from "@/hooks/useWorkouts";
import { getAllExercises, getFavoritesExercises } from "@/utils/getExercises";
import { getServerSession } from "next-auth";

export const revalidate = 60;
export default async function CreateWorkoutPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;
  const exercises = (await getAllExercises(userId)) || [];
  const favorites = (await getFavoritesExercises(userId)) || [];
  return (
    <>
      <Header />
      <main>
        <h1>Créer un nouvel entraînement</h1>
        <WorkoutTemplateForm
          allExercises={exercises}
          favorites={favorites}
          isAdmin={isAdmin}
          userId={userId}
        />
      </main>
    </>
  );
}
