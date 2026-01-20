import { ObjectId } from "mongodb";
import { ExerciseDB } from "./exercise";

/**
 * Type MongoDB pour le document User
 */
export type UserDocument = {
    _id: ObjectId;
    name?: string;
    email: string;
    password?: string;
    role?: string;
    exercises?: ExerciseDB[]; // Exercices privés de l'utilisateur
    favoritesExercises?: string[]; // IDs des exercices favoris
    createdAt: Date;
    updatedAt?: Date;
};
