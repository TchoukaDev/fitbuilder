import { ObjectId } from "mongodb";

/**
 * Document MongoDB pour la collection `users`.
 * Les tableaux workouts[], sessions[], exercises[] ont été déplacés
 * dans leurs collections respectives — ce document ne contient plus que
 * les données propres à l'utilisateur.
 */
export interface UserDocument {
    _id: ObjectId;
    username?: string;
    email: string;
    password?: string;
    role?: string;
    blocked?: boolean;
    favoritesExercises?: string[];
    createdAt: Date;
    updatedAt?: Date;
    loginAttempts?: number;
    lastFailedLogin?: Date | null;
    googleId?: string | null;
    image?: string | null;
    emailVerified?: boolean;
    emailVerifiedAt?: Date | null;
}
