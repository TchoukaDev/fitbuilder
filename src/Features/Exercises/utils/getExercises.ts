"use server";
import connectDB from "@/libs/mongodb";
import { Exercise, ExerciseDB } from "@/types/exercise";
import { ObjectId } from "mongodb";



// Récupère tous les exercices publics triés par muscle puis nom
export async function getPublicExercises(): Promise<Exercise[]> {
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
    id: _id.toString(),
  }));
}

// Récupère les exercices privés d'un utilisateur triés par muscle puis nom
export async function getPrivateExercises(userId: string): Promise<Exercise[]> {
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
    id: _id.toString(),
  }));
}

// Récupère tous les exercices (publics + privés) en parallèle
export async function getAllExercises(userId: string): Promise<Exercise[]> {
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

// Récupère les IDs des exercices favoris d'un utilisateur
export async function getFavoritesExercises(userId: string): Promise<string[]> {
  const db = await connectDB();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  const favoritesExercises: string[] = user?.favoritesExercises || [];
  return favoritesExercises;
}
