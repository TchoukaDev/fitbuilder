import { ObjectId } from "mongodb";
import { WorkoutExercise } from "@/types/workoutExercise";

/**
 * Document MongoDB pour la collection `workouts`.
 * Remplace users.workouts[] (modèle embarqué) par une collection séparée.
 */
export interface WorkoutDocument {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    description: string;
    category: string;
    estimatedDuration: number;
    exercises: WorkoutExercise[];
    timesUsed: number;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
