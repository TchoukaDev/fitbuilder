import { SessionDocument } from "@/models/SessionDocument";
import { WorkoutDocument } from "@/models/WorkoutDocument";
import { SessionExercise } from "@/types/SessionExercise";
import { WorkoutSession } from "@/types/workoutSession";
import { Db, ObjectId } from "mongodb";

// Données nécessaires pour créer une nouvelle session
export type NewSessionData = {
    workoutId: string;
    workoutName: string;
    scheduledDate: Date;
    status: "planned" | "in-progress";
    isPlanned: boolean;
    startedAt: Date | null;
    estimatedDuration: number;
    exercises: SessionExercise[];
};

// Données nécessaires pour mettre à jour une session planifiée
export type PlannedSessionUpdate = {
    workoutId: string;
    workoutName: string;
    exercises: SessionExercise[];
    scheduledDate: Date;
    estimatedDuration: number;
};

export class SessionRepository {
    constructor(private readonly db: Db) { }

    private toSession({ _id, userId, workoutId, ...rest }: SessionDocument): WorkoutSession {
        return {
            ...rest,
            id: _id.toString(),
            userId: userId.toString(),
            workoutId: workoutId.toString(),
        };
    }

    // ─── READ ────────────────────────────────────────────────────────────────────

    async findById(userId: string, sessionId: string): Promise<WorkoutSession | null> {
        const doc = await this.db
            .collection<SessionDocument>("sessions")
            .findOne({ _id: new ObjectId(sessionId), userId: new ObjectId(userId) });
        if (!doc) return null;
        return this.toSession(doc);
    }

    async findAll(userId: string): Promise<WorkoutSession[]> {
        const docs = await this.db
            .collection<SessionDocument>("sessions")
            .find({ userId: new ObjectId(userId) })
            .toArray();
        return docs.map((d) => this.toSession(d));
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    async create(userId: string, data: NewSessionData, isPlanning: boolean): Promise<string> {
        const sessionId = new ObjectId();

        const doc: SessionDocument = {
            _id: sessionId,
            userId: new ObjectId(userId),
            workoutId: new ObjectId(data.workoutId),
            workoutName: data.workoutName,
            scheduledDate: data.scheduledDate as unknown as string,
            status: data.status,
            isPlanned: data.isPlanned,
            startedAt: data.startedAt as unknown as string,
            completedDate: null,
            estimatedDuration: data.estimatedDuration,
            duration: "0",
            notes: null,
            effort: null,
            exercises: data.exercises,
            createdAt: new Date() as unknown as string,
            updatedAt: new Date() as unknown as string,
        };

        await this.db.collection<SessionDocument>("sessions").insertOne(doc);

        // Si démarrage immédiat : incrémenter timesUsed + lastUsedAt du workout
        if (!isPlanning) {
            await this.db.collection<WorkoutDocument>("workouts").updateOne(
                { _id: new ObjectId(data.workoutId), userId: new ObjectId(userId) },
                { $inc: { timesUsed: 1 }, $set: { lastUsedAt: new Date() } }
            );
        }

        return sessionId.toString();
    }

    // ─── PATCH ACTIONS ───────────────────────────────────────────────────────────

    async start(
        userId: string,
        sessionId: string,
        workoutId: string,
        resetedExercises: SessionExercise[]
    ): Promise<void> {
        await this.db.collection<SessionDocument>("sessions").updateOne(
            { _id: new ObjectId(sessionId), userId: new ObjectId(userId) },
            {
                $set: {
                    startedAt: new Date() as unknown as string,
                    exercises: resetedExercises,
                    status: "in-progress",
                    updatedAt: new Date() as unknown as string,
                },
            }
        );
        await this.db.collection<WorkoutDocument>("workouts").updateOne(
            { _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
            { $inc: { timesUsed: 1 }, $set: { lastUsedAt: new Date() } }
        );
    }

    async save(
        userId: string,
        sessionId: string,
        exercises: SessionExercise[],
        duration: number
    ): Promise<void> {
        await this.db.collection<SessionDocument>("sessions").updateOne(
            { _id: new ObjectId(sessionId), userId: new ObjectId(userId) },
            {
                $set: {
                    exercises,
                    duration: duration as unknown as string,
                    updatedAt: new Date() as unknown as string,
                },
            }
        );
    }

    async cancel(
        userId: string,
        sessionId: string,
        workoutId: string,
        newTimesUsed: number,
        newLastUsedAt: Date | null
    ): Promise<void> {
        await this.db.collection<SessionDocument>("sessions").updateOne(
            { _id: new ObjectId(sessionId), userId: new ObjectId(userId) },
            {
                $set: {
                    startedAt: null,
                    completedDate: null,
                    duration: "0",
                    status: "planned",
                    updatedAt: new Date() as unknown as string,
                    "exercises.$[].actualSets": [],
                    "exercises.$[].completed": false,
                    "exercises.$[].effort": null,
                    "exercises.$[].notes": "",
                },
            }
        );
        await this.db.collection<WorkoutDocument>("workouts").updateOne(
            { _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
            { $set: { timesUsed: newTimesUsed, lastUsedAt: newLastUsedAt } }
        );
    }

    async updatePlanned(
        userId: string,
        sessionId: string,
        data: PlannedSessionUpdate
    ): Promise<void> {
        await this.db.collection<SessionDocument>("sessions").updateOne(
            { _id: new ObjectId(sessionId), userId: new ObjectId(userId) },
            {
                $set: {
                    workoutId: new ObjectId(data.workoutId),
                    workoutName: data.workoutName,
                    exercises: data.exercises,
                    scheduledDate: data.scheduledDate as unknown as string,
                    estimatedDuration: data.estimatedDuration,
                    updatedAt: new Date() as unknown as string,
                },
            }
        );
    }

    // ─── PUT ────────────────────────────────────────────────────────────────────

    async complete(
        userId: string,
        sessionId: string,
        exercises: SessionExercise[],
        duration: number
    ): Promise<void> {
        await this.db.collection<SessionDocument>("sessions").updateOne(
            { _id: new ObjectId(sessionId), userId: new ObjectId(userId) },
            {
                $set: {
                    exercises,
                    status: "completed",
                    completedDate: new Date() as unknown as string,
                    duration: duration as unknown as string,
                    updatedAt: new Date() as unknown as string,
                },
            }
        );
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────────

    async delete(userId: string, sessionId: string): Promise<void> {
        await this.db.collection<SessionDocument>("sessions").deleteOne({
            _id: new ObjectId(sessionId),
            userId: new ObjectId(userId),
        });
    }

    async updateWorkoutStats(
        userId: string,
        workoutId: string,
        timesUsed: number,
        lastUsedAt: Date | null
    ): Promise<void> {
        await this.db.collection<WorkoutDocument>("workouts").updateOne(
            { _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
            { $set: { timesUsed, lastUsedAt } }
        );
    }
}
