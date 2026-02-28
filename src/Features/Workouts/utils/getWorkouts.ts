"use server";
import connectDB from "@/libs/mongodb";
import { WorkoutRepository } from "@/repositories/WorkoutRepository";
import { Workout } from "@/types/workout";
import { unstable_cache } from "next/cache";

async function _getWorkouts(userId: string): Promise<Workout[]> {
  const db = await connectDB();
  const workoutRepository = new WorkoutRepository(db)



  const workouts = await workoutRepository.findAll(userId)

  return workouts || []
}
export const getWorkouts = unstable_cache(_getWorkouts, ["allWorkouts"], { revalidate: 300, tags: ["workouts"] });



async function _getWorkoutById(
  userId: string,
  workoutId: string
): Promise<Workout | null> {
  const db = await connectDB();
  const workoutRepository = new WorkoutRepository(db)


  const workout = await workoutRepository.findById(userId, workoutId)
  return workout
}
export const getWorkoutById = unstable_cache(_getWorkoutById, ["workoutById"], { revalidate: 300, tags: ["workouts"] });