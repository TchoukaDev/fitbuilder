import { WorkoutExercise } from "./workoutExercise";
import { ObjectId } from "mongodb";

// Type de base partagé (champs communs)
type WorkoutSessionBase = {
    workoutName: string;
    scheduledDate: string;
    status: "planned" | "in-progress" | "completed";
    notes: string | null;
    effort: number | null;
    isPlanned: boolean;
    startedAt: string | null;
    completedDate: string | null;
    estimatedDuration: number;
    duration: string;
    exercises: SessionExercise[];
    createdAt: string;
    updatedAt: string;
}

// Type MongoDB (ce qui vient de la DB - avec ObjectId)
export type WorkoutSessionDB = WorkoutSessionBase & {
    _id: ObjectId;
    userId: ObjectId;
    workoutId: ObjectId;
}

// Type Application (ce que votre app utilise - avec strings)
export type WorkoutSession = WorkoutSessionBase & {
    id: string;
    userId: string;
    workoutId: string;
}


export type CompletedSessionType = Omit<WorkoutSession, "completedDate" | "startedAt" | "status"> & {
    startedAt: string;
    completedDate: string;
    status: "completed";
}

export type SessionExercise = {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number | string;
    targetWeight: number;
    restTime: number;
    actualSets: SessionExerciseSet[];
    notes: string | null;
    effort: number | null;
    completed: boolean;
}

export type SessionExerciseSet = {
    reps: number | null;
    weight: number | null;
    completed: boolean;
}