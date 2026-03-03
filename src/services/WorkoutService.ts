import { DbError, DuplicateError, NotFoundError, UnauthorizedError, ValidationError } from "@/libs/ServicesErrors";
import { WorkoutRepository } from "@/repositories/WorkoutRepository";
import { Workout } from "@/types/workout";
import { WorkoutExercise } from "@/types/workoutExercise";

export class WorkoutService {
    constructor(private readonly workoutRepository: WorkoutRepository) { }

    async getAll(userId: string): Promise<Workout[] | null> {
        this.requireAuth(userId)
        try {
            return await this.workoutRepository.findAll(userId)
        }
        catch {
            throw new DbError("Erreur lors de la récupération des Workouts")
        }

    }

    async getById(userId: string, workoutId: string): Promise<Workout> {
        this.requireAuth(userId)
        try {
            const workout = await this.workoutRepository.findById(userId, workoutId)
            if (!workout) throw new NotFoundError("Ce workout n'existe pas")
            return workout
        }
        catch (e) {
            if (e instanceof NotFoundError) throw e
            else throw new DbError("Erreur lors de la récupération du workout")
        }

    }

    async create(userId: string, data: {
        name: string; description: string; category: string; estimatedDuration: number; exercises:
        WorkoutExercise[]
    }): Promise<Workout> {
        this.requireAuth(userId)
        if (!data) throw new ValidationError()

        // Vérifier le doublon de nom
        const workouts = await this.workoutRepository.findAll(userId)
        const nameExist = workouts?.some((w: Workout) => w.name.toLowerCase() === data.name.toLowerCase())
        if (nameExist) {
            throw new DuplicateError("Ce nom de workout est déjà utilisé")
        }

        try {
            return await this.workoutRepository.create(userId, data)
        } catch (e) {
            throw new DbError("Erreur lors de la création du workout")
        }
    }

    async update(userId: string, workoutId: string, data: {
        name: string; description: string; category: string; estimatedDuration: number; exercises:
        WorkoutExercise[]
    }): Promise<Workout> {
        this.requireAuth(userId)
        this.requireWorkout(workoutId)
        if (!data) throw new ValidationError()

        // Vérifier le doublon de nom
        const workouts = await this.workoutRepository.findAll(userId)
        const nameExist = workouts?.filter((w: Workout) => w.id !== workoutId).some((w: Workout) => w.name.toLowerCase() === data.name.toLowerCase())
        if (nameExist) {
            throw new DuplicateError("Ce nom de workout est déjà utilisé")
        }

        try {
            const workout = await this.workoutRepository.update(userId, workoutId, data)
            if (!workout) throw new NotFoundError("Workout introuvable")
            return workout
        } catch (e) {
            if (e instanceof NotFoundError) throw e
            throw new DbError("Erreur lors de la modification du Workout")
        }
    }

    async delete(userId: string, workoutId: string): Promise<void> {
        this.requireAuth(userId)
        this.requireWorkout(workoutId)
        try {
            await this.workoutRepository.delete(userId, workoutId)
        }
        catch (e) {
            throw new DbError("Erreur lors de la suppression du workout")
        }
    }

    requireAuth(userId: string) {
        if (!userId) throw new UnauthorizedError
    }

    requireWorkout(workoutId: string) {
        if (!workoutId) throw new NotFoundError("Workout Introuvable")
    }
}
