import { WorkoutExercise } from "./workoutExercise";
import { ObjectId } from "mongodb";

// Type de base partagé (DRY - Don't Repeat Yourself)
type WorkoutBase = {
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

// Type MongoDB (ce qui vient de la DB)
export type WorkoutDB = WorkoutBase & {
    _id: ObjectId;
}

// Type Application (ce que votre app utilise)
export type Workout = WorkoutBase & {
    id: string;
}