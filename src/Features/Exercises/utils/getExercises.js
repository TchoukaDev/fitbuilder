"use server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";

// Récupère tous les exercices publics triés par muscle puis nom
export async function getPublicExercises() {
  const db = await connectDB();
  const publicExercises =
    (await db
      .collection("exercises")
      .find({ isPublic: true })
      .sort({ muscle: 1, name: 1 })
      .toArray()) || [];

  return publicExercises?.map((e) => ({
    ...e,
    type: "public",
    _id: e._id.toString(),
  }));
}

// Récupère les exercices privés d'un utilisateur triés par muscle puis nom
export async function getPrivateExercises(userId) {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const privateExercises = (user?.exercises || []).sort((a, b) => {
    return a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
  });

  return privateExercises.map((e) => ({
    ...e,
    type: "private",
    _id: e._id.toString(),
  }));
}

// Récupère tous les exercices (publics + privés) en parallèle
export async function getAllExercises(userId) {
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
export async function getFavoritesExercises(userId) {
  const db = await connectDB();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  const favoritesExercises = user?.favoritesExercises || [];
  return favoritesExercises;
}
