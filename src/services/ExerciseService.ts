import { ExerciseRepository } from "@/repositories/ExerciseRepository";
import { Exercise } from "@/types/exercise";
import {
    DbError,
    DuplicateError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@/libs/ServicesErrors";

type ExerciseData = {
    name: string;
    primary_muscle: string;
    secondary_muscles: string[];
    equipment: string;
    description: string | null;
};

export class ExerciseService {
    constructor(private readonly exerciseRepository: ExerciseRepository) { }

    private requireAuth(userId: string) {
        if (!userId) throw new UnauthorizedError()
    }

    // ─── GET ────────────────────────────────────────────────────────────────────

    async getAll(userId: string): Promise<Exercise[]> {
        this.requireAuth(userId)
        try {
            const [pub, priv] = await Promise.all([
                this.exerciseRepository.findAllPublic(),
                this.exerciseRepository.findAllPrivate(userId),
            ])
            return [...(pub ?? []), ...(priv ?? [])]
        } catch {
            throw new DbError("Erreur lors de la récupération des exercices")
        }
    }

    async getAllPublic(): Promise<Exercise[]> {
        try {
            return (await this.exerciseRepository.findAllPublic()) ?? []
        } catch {
            throw new DbError("Erreur lors de la récupération des exercices publics")
        }
    }

    async getAllPrivate(userId: string): Promise<Exercise[]> {
        this.requireAuth(userId)
        try {
            return (await this.exerciseRepository.findAllPrivate(userId)) ?? []
        } catch {
            throw new DbError("Erreur lors de la récupération des exercices privés")
        }
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    async create(userId: string, isAdmin: boolean, data: ExerciseData): Promise<Exercise> {
        this.requireAuth(userId)

        if (isAdmin) {
            // Vérifier doublon dans les exercices publics
            const publicExercises = await this.exerciseRepository.findAllPublic()
            const nameExists = publicExercises?.some(
                (e) => e.name.toLowerCase() === data.name.toLowerCase()
            )
            if (nameExists) throw new DuplicateError("Cet exercice public existe déjà")

            try {
                return await this.exerciseRepository.createPublic(data)
            } catch {
                throw new DbError("Erreur lors de la création de l'exercice public")
            }
        }

        // Vérifier doublon dans les exercices privés de l'utilisateur
        const privateExercises = await this.exerciseRepository.findAllPrivate(userId)
        const nameExists = privateExercises?.some(
            (e) => e.name.toLowerCase() === data.name.toLowerCase()
        )
        if (nameExists) throw new DuplicateError("Cet exercice existe déjà dans votre bibliothèque")

        try {
            const created = await this.exerciseRepository.createPrivate(userId, data)
            if (!created) throw new DbError("Erreur lors de la création de l'exercice")
            return created
        } catch (e) {
            if (e instanceof DbError) throw e
            throw new DbError("Erreur lors de la création de l'exercice")
        }
    }

    // ─── UPDATE ─────────────────────────────────────────────────────────────────

    async update(userId: string, exerciseId: string, isAdmin: boolean, data: ExerciseData): Promise<Exercise> {
        this.requireAuth(userId)

        // Vérifier si c'est un exercice public
        const publicExercise = await this.exerciseRepository.findPublicById(exerciseId)
        if (publicExercise) {
            if (!isAdmin) throw new ForbiddenError("Seul un admin peut modifier les exercices publics")
            const updated = await this.exerciseRepository.updatePublic(exerciseId, data)
            if (!updated) throw new NotFoundError("Exercice public introuvable")
            return updated
        }

        // Exercice privé
        const updated = await this.exerciseRepository.updatePrivate(userId, exerciseId, data)
        if (!updated) throw new NotFoundError("Exercice introuvable ou non autorisé")
        return updated
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────────

    async delete(userId: string, exerciseId: string, isAdmin: boolean): Promise<void> {
        this.requireAuth(userId)

        // Vérifier si c'est un exercice public
        const publicExercise = await this.exerciseRepository.findPublicById(exerciseId)
        if (publicExercise) {
            if (!isAdmin) throw new ForbiddenError("Seul un admin peut supprimer les exercices publics")
            try {
                await this.exerciseRepository.deletePublic(exerciseId)
            } catch {
                throw new DbError("Erreur lors de la suppression de l'exercice public")
            }
            return
        }

        // Exercice privé — vérifier qu'il appartient bien à l'utilisateur
        const privateExercise = await this.exerciseRepository.findPrivateById(userId, exerciseId)
        if (!privateExercise) throw new NotFoundError("Exercice introuvable")

        try {
            await this.exerciseRepository.deletePrivate(userId, exerciseId)
        } catch {
            throw new DbError("Erreur lors de la suppression de l'exercice")
        }
    }

    // ─── FAVORITES ──────────────────────────────────────────────────────────────

    async getFavorites(userId: string): Promise<string[]> {
        this.requireAuth(userId)
        try {
            return (await this.exerciseRepository.findAllFavorites(userId)) ?? []
        } catch {
            throw new DbError("Erreur lors de la récupération des favoris")
        }
    }

    async toggleFavorite(userId: string, exerciseId: string, action: "add" | "remove"): Promise<string[]> {
        this.requireAuth(userId)
        if (!exerciseId) throw new NotFoundError("Exercice introuvable")

        try {
            if (action === "add") {
                return (await this.exerciseRepository.addFavorite(userId, exerciseId)) ?? []
            }
            return (await this.exerciseRepository.removeFavorite(userId, exerciseId)) ?? []
        } catch {
            throw new DbError("Erreur lors de la mise à jour des favoris")
        }
    }
}
