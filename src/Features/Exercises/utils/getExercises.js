"use server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";

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

export async function getPrivateExercises(userId) {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const privateExercises = (user?.exercises || []).sort((a, b) => {
    // Tri par muscle puis name
    return a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
  });

  return privateExercises.map((e) => ({
    ...e,
    type: "private",
    _id: e._id.toString(),
  }));
}

export async function getAllExercises(userId) {
  // ✅ Exécuter les deux requêtes en parallèle (plus rapide)
  const [publicExercises, privateExercises] = await Promise.all([
    getPublicExercises(),
    getPrivateExercises(userId),
  ]);

  const allExercises = [...publicExercises, ...privateExercises];

  allExercises.sort((a, b) => {
    return a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
  });

  return allExercises;
}

export async function getFavoritesExercises(userId) {
  const db = await connectDB();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  const favoritesExercises = user?.favoritesExercises || [];
  return favoritesExercises;
}
