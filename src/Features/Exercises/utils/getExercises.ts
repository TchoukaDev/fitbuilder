"use server";
import connectDB from "@/libs/mongodb";
import { Exercise } from "@/types/exercise";
import { unstable_cache } from "next/cache";
import { ExerciseRepository } from "@/repositories/ExerciseRepository";
import { ExerciseService } from "@/services/ExerciseService";
import { getMuscleCategory } from "./muscleCategory";

async function _getPublicExercises(): Promise<Exercise[]> {
  const db = await connectDB();
  const service = new ExerciseService(new ExerciseRepository(db));
  return service.getAllPublic();
}
export const getPublicExercises = unstable_cache(_getPublicExercises, ["publicExercises"], { revalidate: 300, tags: ["exercises"] });

async function _getPrivateExercises(userId: string): Promise<Exercise[]> {
  const db = await connectDB();
  const service = new ExerciseService(new ExerciseRepository(db));
  return service.getAllPrivate(userId);
}
export const getPrivateExercises = unstable_cache(_getPrivateExercises, ["privateExercises"], { revalidate: 300, tags: ["exercises"] });

async function _getAllExercises(userId: string): Promise<Exercise[]> {
  const db = await connectDB();
  const service = new ExerciseService(new ExerciseRepository(db));
  const all = await service.getAll(userId);
  return all.sort((a, b) =>
    getMuscleCategory(a.primary_muscle).localeCompare(getMuscleCategory(b.primary_muscle)) ||
    a.name.localeCompare(b.name)
  );
}
export const getAllExercises = unstable_cache(_getAllExercises, ["allExercises"], { revalidate: 300, tags: ["exercises"] });

async function _getFavoritesExercises(userId: string): Promise<string[]> {
  const db = await connectDB();
  const service = new ExerciseService(new ExerciseRepository(db));
  return service.getFavorites(userId);
}
export const getFavoritesExercises = unstable_cache(_getFavoritesExercises, ["favoritesExercises"], { revalidate: 300, tags: ["favorites"] });
