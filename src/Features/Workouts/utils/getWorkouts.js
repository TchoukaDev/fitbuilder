"use server";
import connectDB from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function getWorkouts(userId) {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  const workouts = user?.workouts || [];

  // Transformation DB → App (_id → id)
  return workouts.map((workout) => ({
    ...workout,
    id: workout._id.toString(),
  }));
}

export async function getWorkoutById(userId, workoutId) {
  const db = await connectDB();

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  const workout = user?.workouts.find((w) => w._id.toString() === workoutId);

  if (!workout) return null;

  // Transformation DB → App (_id → id)
  return { ...workout, id: workoutId };
}
