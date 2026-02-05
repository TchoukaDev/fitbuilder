"use server";
import connectDB from "@/libs/mongodb";
import { Workout, WorkoutDB } from "@/types/workout";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";

async function _getWorkouts(userId: string): Promise<Workout[]> {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const workouts: WorkoutDB[] = user?.workouts || [];

  // Transformation DB → App (ObjectId → string, _id → id)
  return workouts.map(({ _id, ...workout }: WorkoutDB) => ({
    ...workout,
    id: _id.toString(),
  }));
}
export const getWorkouts = unstable_cache(_getWorkouts, ["allWorkouts"], { revalidate: 300, tags: ["workouts"] });



async function _getWorkoutById(
  userId: string,
  workoutId: string
): Promise<Workout | null> {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const workouts: WorkoutDB[] = user?.workouts || [];
  const workout = workouts.find((w) => w._id.toString() === workoutId);

  if (!workout) return null;

  // Transformation DB → App
  const { _id, ...workoutData } = workout;
  return {
    ...workoutData,
    id: _id.toString(),
  };
}
export const getWorkoutById = unstable_cache(_getWorkoutById, ["workoutById"], { revalidate: 300, tags: ["workouts"] });