import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";
// import ExercisesList from "./ExercisesList";
import Link from "next/link";

// ✅ Cache ISR de 60 secondes
export const revalidate = 60;

async function getExercises(userId) {
  const db = await connectDB();

  const publicExercises = await db
    .collection("exercises")
    .find({ isPublic: true })
    .sort({ muscle: 1, name: 1 })
    .toArray();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const privateExercises = user?.exercises || [];

  return [
    ...publicExercises.map((ex) => ({
      ...ex,
      type: "public",
      _id: ex._id.toString(),
    })),
    ...privateExercises.map((ex) => ({
      ...ex,
      type: "private",
      _id: ex._id.toString(),
    })),
  ];
}

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const exercises = await getExercises(session.user.id);

  return (
    <>
      <PageLayout />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes exercices</h1>
          <Link
            href="/admin/exercises"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Ajouter un exercice
          </Link>
        </div>

        {/* <ExercisesList initialExercises={exercises} /> */}
      </div>
    </>
  );
}
