import { ObjectId } from "mongodb";
import { ExerciseDB } from "./exercise";
import { WorkoutSessionDB } from "./workoutSession";
import { WorkoutDB } from "./workout";

/**
 * Type MongoDB pour le document User
 */
export type UserDocument = {
    _id: ObjectId;
    username?: string;
    email: string;
    password?: string;
    role?: string;
    blocked?: boolean;
    exercises?: ExerciseDB[]; // Exercices privés de l'utilisateur
    favoritesExercises?: string[]; // IDs des exercices favoris
    createdAt: Date;
    updatedAt?: Date
    sessions?: WorkoutSessionDB[];
    workouts?: WorkoutDB[];
    loginAttempts?: number;
    lastFailedLogin?: Date | null;
    googleId?: string | null;
    image?: string | null;
    emailVerified?: boolean;
    emailVerifiedAt?: Date | null;
};
