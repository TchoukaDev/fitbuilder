import { ObjectId } from "mongodb";
import { SessionExercise } from "@/types/SessionExercise";

/**
 * Document MongoDB pour la collection `sessions`.
 * Remplace users.sessions[] (modèle embarqué) par une collection séparée.
 */
export interface SessionDocument {
    _id: ObjectId;
    userId: ObjectId;
    workoutId: ObjectId;
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
