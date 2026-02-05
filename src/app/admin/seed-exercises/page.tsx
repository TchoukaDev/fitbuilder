
import SeedExercises from "./SeedExercises";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

export default async function SeedExercisesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }
  const isAdmin = session?.user?.role === "ADMIN";
  if (!isAdmin) {
    redirect("/dashboard?error=access-denied");
  }
  return (
    <>
      <h1>Seed Exercises</h1>
      <SeedExercises />
    </>
  );
}