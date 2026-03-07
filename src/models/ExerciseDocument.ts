import { ObjectId } from "mongodb";

/**
 * Document MongoDB pour la collection `exercises`.
 * Fusionne les exercices publics (ancienne collection `exercises`)
 * et les exercices privés (anciens users.exercises[]) dans une seule collection.
 *
 * userId === null  →  exercice public (visible par tous)
 * userId === ObjectId  →  exercice privé (visible uniquement par son créateur)
 */
export interface ExerciseDocument {
    _id: ObjectId;
    userId: ObjectId | null;
    name: string;
    primary_muscle: string;
    secondary_muscles: string[];
    equipment: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
}
