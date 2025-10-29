import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ExercisesList from "@/components/Exercises/ExercisesList/ExercisesList";
import { getServerSession } from "next-auth";

// ✅ Cache ISR de 60 secondes
export const revalidate = 60;

async function getAllExercises(userId) {
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

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const exercises = await getAllExercises(userId);

  return <ExercisesList initialExercises={exercises} />;
}
