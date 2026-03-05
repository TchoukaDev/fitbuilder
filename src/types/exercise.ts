import { ObjectId } from "mongodb";

// Type de base partagé (DRY)
type ExerciseBase = {
    name: string;
    muscle: string;
    muscles: string[];
    equipment: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
}

// Type MongoDB (ce qui vient de la DB)
export type ExerciseDB = ExerciseBase & {
    _id: ObjectId;
}

// Type Application (ce que votre app utilise)
export type Exercise = ExerciseBase & {
    exerciseId: string;
}