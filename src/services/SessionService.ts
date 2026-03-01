import { NewSessionData, PlannedSessionUpdate, SessionRepository } from "@/repositories/SessionRepository";
import { SessionExercise } from "@/types/SessionExercise";
import { WorkoutExercise } from "@/types/workoutExercise";
import { WorkoutSession } from "@/types/workoutSession";
import { DbError, NotFoundError, UnauthorizedError, ValidationError } from "@/libs/ServicesErrors";

type CreateSessionInput = {
    workoutId: string;
    workoutName: string;
    exercises: WorkoutExercise[];
    scheduledDate?: string;
    estimatedDuration?: number;
    isPlanning: boolean;
};

type UpdatePlannedInput = {
    workoutId: string;
    workoutName: string;
    exercises: SessionExercise[];
    scheduledDate: string;
    estimatedDuration: number;
};

export class SessionService {
    constructor(private readonly sessionRepository: SessionRepository) { }

    private requireAuth(userId: string) {
        if (!userId) throw new UnauthorizedError();
    }

    // Convertit les exercices du plan (WorkoutExercise) en exercices de session (SessionExercise)
    // Les séries réelles sont initialisées à vide, prêtes à être remplies pendant la séance
    private buildSessionExercises(workoutExercises: WorkoutExercise[]): SessionExercise[] {
        return workoutExercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            order: ex.order,
            targetSets: ex.sets,
            targetReps: ex.reps,
            targetWeight: ex.targetWeight,
            restTime: ex.restTime ?? 90,
            actualSets: Array.from({ length: ex.sets }).map(() => ({
                reps: undefined,
                weight: ex.targetWeight,
                completed: false,
            })),
            notes: "",
            effort: null,
            completed: false,
        }));
    }

    // Calcule les stats d'un workout après qu'une session complétée est retirée (cancel ou delete)
    // Retourne le nouveau timesUsed et la nouvelle lastUsedAt
    private computeWorkoutStatsAfterRemoval(
        allSessions: WorkoutSession[],
        workoutId: string,
        excludeSessionId: string
    ): { timesUsed: number; lastUsedAt: Date | null } {
        // Sessions complétées du même workout, en excluant celle qu'on vient de retirer
        const completedSessions = allSessions.filter(
            (s) =>
                s.workoutId.toString() === workoutId &&
                s.id !== excludeSessionId &&
                s.status === "completed"
        );

        const timesUsed = completedSessions.length;

        let lastUsedAt: Date | null = null;
        if (completedSessions.length > 0) {
            completedSessions.sort(
                (a, b) =>
                    new Date(b.completedDate!).getTime() -
                    new Date(a.completedDate!).getTime()
            );
            lastUsedAt = new Date(completedSessions[0].completedDate!);
        }

        return { timesUsed, lastUsedAt };
    }

    // ─── GET ────────────────────────────────────────────────────────────────────

    async getById(userId: string, sessionId: string): Promise<WorkoutSession> {
        this.requireAuth(userId);
        try {
            const session = await this.sessionRepository.findById(userId, sessionId);
            if (!session) throw new NotFoundError("Session introuvable");
            return session;
        } catch (e) {
            if (e instanceof NotFoundError) throw e;
            throw new DbError("Erreur lors de la récupération de la session");
        }
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    async create(userId: string, input: CreateSessionInput): Promise<string> {
        this.requireAuth(userId);

        if (!input.workoutId || !input.workoutName || input.exercises.length === 0) {
            throw new ValidationError(
                "La session doit être liée à un entraînement et contenir au moins un exercice"
            );
        }

        const sessionExercises = this.buildSessionExercises(input.exercises);

        const data: NewSessionData = {
            workoutId: input.workoutId,
            workoutName: input.workoutName,
            scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : new Date(),
            status: input.isPlanning ? "planned" : "in-progress",
            isPlanned: input.isPlanning,
            startedAt: input.isPlanning ? null : new Date(),
            estimatedDuration: input.estimatedDuration ?? 60,
            exercises: sessionExercises,
        };

        try {
            return await this.sessionRepository.create(userId, data, input.isPlanning);
        } catch {
            throw new DbError("Erreur lors de la création de la session");
        }
    }

    // ─── PATCH ACTIONS ───────────────────────────────────────────────────────────

    async start(userId: string, sessionId: string): Promise<void> {
        this.requireAuth(userId);

        const session = await this.sessionRepository.findById(userId, sessionId);
        if (!session) throw new NotFoundError("Session introuvable");

        // Réinitialiser les séries réelles (on repart de zéro)
        const resetedExercises: SessionExercise[] = session.exercises.map((ex) => ({
            ...ex,
            actualSets: Array.from({ length: ex.targetSets }).map(() => ({
                reps: undefined,
                weight: ex.targetWeight,
                completed: false,
            })),
        }));

        try {
            await this.sessionRepository.start(userId, sessionId, session.workoutId, resetedExercises);
        } catch {
            throw new DbError("Erreur lors du démarrage de la session");
        }
    }

    async save(
        userId: string,
        sessionId: string,
        exercises: SessionExercise[],
        duration: number
    ): Promise<void> {
        this.requireAuth(userId);

        if (!exercises || !Array.isArray(exercises)) {
            throw new ValidationError("Les exercices fournis ne sont pas valides");
        }

        try {
            await this.sessionRepository.save(userId, sessionId, exercises, duration);
        } catch {
            throw new DbError("Erreur lors de la sauvegarde de la progression");
        }
    }

    async cancel(userId: string, sessionId: string): Promise<void> {
        this.requireAuth(userId);

        const session = await this.sessionRepository.findById(userId, sessionId);
        if (!session) throw new NotFoundError("Session introuvable");

        if (session.status !== "in-progress") {
            throw new ValidationError("Seules les sessions en cours peuvent être annulées");
        }

        // Recalculer les stats du workout en tenant compte de cette session (qui n'était pas "completed")
        const allSessions = await this.sessionRepository.findAll(userId);
        const { timesUsed, lastUsedAt } = this.computeWorkoutStatsAfterRemoval(
            allSessions,
            session.workoutId,
            sessionId
        );

        try {
            await this.sessionRepository.cancel(
                userId,
                sessionId,
                session.workoutId,
                timesUsed,
                lastUsedAt
            );
        } catch {
            throw new DbError("Erreur lors de l'annulation de la session");
        }
    }

    async updatePlanned(
        userId: string,
        sessionId: string,
        input: UpdatePlannedInput
    ): Promise<void> {
        this.requireAuth(userId);

        if (!input) throw new ValidationError("Données de mise à jour manquantes");

        const data: PlannedSessionUpdate = {
            workoutId: input.workoutId,
            workoutName: input.workoutName,
            exercises: input.exercises,
            scheduledDate: new Date(input.scheduledDate),
            estimatedDuration: input.estimatedDuration,
        };

        try {
            await this.sessionRepository.updatePlanned(userId, sessionId, data);
        } catch {
            throw new DbError("Erreur lors de la mise à jour de la session");
        }
    }

    // ─── PUT ────────────────────────────────────────────────────────────────────

    async complete(
        userId: string,
        sessionId: string,
        exercises: SessionExercise[],
        duration: number
    ): Promise<void> {
        this.requireAuth(userId);

        const session = await this.sessionRepository.findById(userId, sessionId);
        if (!session) throw new NotFoundError("Session introuvable");

        try {
            await this.sessionRepository.complete(userId, sessionId, exercises, duration);
        } catch {
            throw new DbError("Erreur lors de la finalisation de la session");
        }
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────────

    async delete(userId: string, sessionId: string): Promise<void> {
        this.requireAuth(userId);

        const session = await this.sessionRepository.findById(userId, sessionId);
        if (!session) throw new NotFoundError("Session introuvable");

        const workoutId = session.workoutId;

        try {
            await this.sessionRepository.delete(userId, sessionId);
        } catch {
            throw new DbError("Erreur lors de la suppression de la session");
        }

        // Recalculer les stats du workout après suppression
        const remainingSessions = await this.sessionRepository.findAll(userId);
        const { timesUsed, lastUsedAt } = this.computeWorkoutStatsAfterRemoval(
            remainingSessions,
            workoutId,
            sessionId // déjà supprimée, mais le filtre l'exclura via id !== sessionId
        );

        try {
            await this.sessionRepository.updateWorkoutStats(userId, workoutId, timesUsed, lastUsedAt);
        } catch {
            throw new DbError("Erreur lors de la mise à jour des stats du workout");
        }
    }
}
