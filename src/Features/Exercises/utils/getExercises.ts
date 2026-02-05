"use server";
import connectDB from "@/libs/mongodb";
import { Exercise, ExerciseDB } from "@/types/exercise";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";



// Récupère tous les exercices publics triés par muscle puis nom
async function _getPublicExercises(): Promise<Exercise[]> {
  const db = await connectDB();
  const publicExercises: ExerciseDB[] =
    (await db
      .collection("exercises")
      .find({ isPublic: true })
      .sort({ muscle: 1, name: 1 })
      .toArray()) as ExerciseDB[] || [];

  // Transformation DB → App (ObjectId → string, _id → id)
  return publicExercises.map(({ _id, ...exercise }) => ({
    ...exercise,
    exerciseId: _id.toString(),
  }));
}

export const getPublicExercises = unstable_cache(_getPublicExercises, ["publicExercises"], { revalidate: 300, tags: ["exercises"] });

// Récupère les exercices privés d'un utilisateur triés par muscle puis nom
async function _getPrivateExercises(userId: string): Promise<Exercise[]> {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const privateExercises: ExerciseDB[] = (user?.exercises || []).sort((a: ExerciseDB, b: ExerciseDB) => {
    return a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
  });

  // Transformation DB → App (ObjectId → string, _id → id)
  return privateExercises.map(({ _id, ...exercise }) => ({
    ...exercise,
    exerciseId: _id.toString(),
  }));
}

export const getPrivateExercises = unstable_cache(_getPrivateExercises, ["privateExercises"], { revalidate: 300, tags: ["exercises"] });



// Récupère tous les exercices (publics + privés) en parallèle
async function _getAllExercises(userId: string): Promise<Exercise[]> {
  const [publicExercises, privateExercises] = await Promise.all([
    getPublicExercises(),
    getPrivateExercises(userId),
  ]);

  const allExercises = [...publicExercises, ...privateExercises];

  // Tri global par muscle puis nom
  allExercises.sort((a, b) => {
    return a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
  });

  return allExercises;
}

export const getAllExercises = unstable_cache(_getAllExercises, ["allExercises"], { revalidate: 300, tags: ["exercises"] });

// Récupère les IDs des exercices favoris d'un utilisateur
async function _getFavoritesExercises(userId: string): Promise<string[]> {
  const db = await connectDB();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  const favoritesExercises: string[] = user?.favoritesExercises || [];
  return favoritesExercises;
}
export const getFavoritesExercises = unstable_cache(_getFavoritesExercises, ["favoritesExercises"], { revalidate: 300, tags: ["favorites"] });
