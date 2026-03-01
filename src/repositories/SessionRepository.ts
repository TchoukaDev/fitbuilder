import { SessionExercise } from "@/types/SessionExercise";
import { UserDocument } from "@/types/user";
import { WorkoutSession, WorkoutSessionDB } from "@/types/workoutSession";
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

    // Transforme un document DB (avec ObjectId) en type applicatif (avec string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private toSession(raw: any): WorkoutSession {
        const { _id, userId, workoutId, ...rest } = raw;
        return {
            ...rest,
            id: _id.toString(),
            userId: userId.toString(),
            workoutId: workoutId.toString(),
        };
    }

    // ─── READ ────────────────────────────────────────────────────────────────────

    async findById(userId: string, sessionId: string): Promise<WorkoutSession | null> {
        const user = await this.db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { sessions: 1 } }
        );
        if (!user) return null;
        const session = user.sessions?.find(
            (s: WorkoutSessionDB) => s._id.toString() === sessionId
        );
        if (!session) return null;
        return this.toSession(session);
    }

    async findAll(userId: string): Promise<WorkoutSession[]> {
        const user = await this.db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { sessions: 1 } }
        );
        if (!user) return [];
        return (user.sessions ?? []).map((s: WorkoutSessionDB) => this.toSession(s));
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    async create(userId: string, data: NewSessionData, isPlanning: boolean): Promise<string> {
        const sessionId = new ObjectId();

        const newSession = {
            _id: sessionId,
            userId: new ObjectId(userId),
            workoutId: new ObjectId(data.workoutId),
            workoutName: data.workoutName,
            scheduledDate: data.scheduledDate,
            status: data.status,
            isPlanned: data.isPlanned,
            startedAt: data.startedAt,
            completedDate: null,
            estimatedDuration: data.estimatedDuration,
            exercises: data.exercises,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Si planification : juste $push la session
        // Si démarrage immédiat : $push + incrémenter timesUsed + lastUsedAt du workout
        const updateQuery = isPlanning
            ? { $push: { sessions: newSession } }
            : {
                $inc: { "workouts.$[workout].timesUsed": 1 },
                $set: { "workouts.$[workout].lastUsedAt": new Date() },
                $push: { sessions: newSession },
            };

        const options = isPlanning
            ? {}
            : { arrayFilters: [{ "workout._id": new ObjectId(data.workoutId) }] };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.db.collection<UserDocument>("users").updateOne(
            { _id: new ObjectId(userId) },
            updateQuery as any,
            options
        );

        return sessionId.toString();
    }

    // ─── PATCH ACTIONS ───────────────────────────────────────────────────────────

    // Démarrer une session planifiée : reset les exercices + incrémenter timesUsed
    async start(
        userId: string,
        sessionId: string,
        workoutId: string,
        resetedExercises: SessionExercise[]
    ): Promise<void> {
        await this.db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    "sessions.$[session].startedAt": new Date(),
                    "sessions.$[session].exercises": resetedExercises,
                    "sessions.$[session].status": "in-progress",
                    "sessions.$[session].updatedAt": new Date(),
                    "workouts.$[workout].lastUsedAt": new Date(),
                },
                $inc: { "workouts.$[workout].timesUsed": 1 },
            },
            {
                arrayFilters: [
                    { "session._id": new ObjectId(sessionId) },
                    { "workout._id": new ObjectId(workoutId) },
                ],
            }
        );
    }

    // Sauvegarder la progression d'une session en cours
    async save(
        userId: string,
        sessionId: string,
        exercises: SessionExercise[],
        duration: number
    ): Promise<void> {
        await this.db.collection("users").updateOne(
            { _id: new ObjectId(userId), "sessions._id": new ObjectId(sessionId) },
            {
                $set: {
                    "sessions.$.exercises": exercises,
                    "sessions.$.duration": duration,
                    "sessions.$.updatedAt": new Date(),
                },
            }
        );
    }

    // Annuler une session en cours : reset la session + décrémente les stats du workout
    // newTimesUsed et newLastUsedAt sont calculés par le service
    async cancel(
        userId: string,
        sessionId: string,
        workoutId: string,
        newTimesUsed: number,
        newLastUsedAt: Date | null
    ): Promise<void> {
        await this.db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    "workouts.$[workout].lastUsedAt": newLastUsedAt,
                    "workouts.$[workout].timesUsed": newTimesUsed,
                    "sessions.$[session].startedAt": null,
                    "sessions.$[session].completedDate": null,
                    "sessions.$[session].duration": null,
                    "sessions.$[session].updatedAt": new Date(),
                    "sessions.$[session].exercises.$[].actualSets": [],
                    "sessions.$[session].exercises.$[].completed": false,
                    "sessions.$[session].exercises.$[].effort": null,
                    "sessions.$[session].exercises.$[].notes": "",
                    "sessions.$[session].status": "planned",
                },
            },
            {
                arrayFilters: [
                    { "workout._id": new ObjectId(workoutId) },
                    { "session._id": new ObjectId(sessionId) },
                ],
            }
        );
    }

    // Modifier une session planifiée (workout, date, exercices...)
    async updatePlanned(
        userId: string,
        sessionId: string,
        data: PlannedSessionUpdate
    ): Promise<void> {
        await this.db.collection("users").updateOne(
            { _id: new ObjectId(userId), "sessions._id": new ObjectId(sessionId) },
            {
                $set: {
                    "sessions.$.workoutId": new ObjectId(data.workoutId),
                    "sessions.$.workoutName": data.workoutName,
                    "sessions.$.exercises": data.exercises,
                    "sessions.$.scheduledDate": data.scheduledDate,
                    "sessions.$.estimatedDuration": data.estimatedDuration,
                    "sessions.$.updatedAt": new Date(),
                },
            }
        );
    }

    // ─── PUT ────────────────────────────────────────────────────────────────────

    // Finaliser une session (status → "completed")
    async complete(
        userId: string,
        sessionId: string,
        exercises: SessionExercise[],
        duration: number
    ): Promise<void> {
        await this.db.collection("users").updateOne(
            { _id: new ObjectId(userId), "sessions._id": new ObjectId(sessionId) },
            {
                $set: {
                    "sessions.$.exercises": exercises,
                    "sessions.$.status": "completed",
                    "sessions.$.completedDate": new Date(),
                    "sessions.$.duration": duration,
                    "sessions.$.updatedAt": new Date(),
                },
            }
        );
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────────

    async delete(userId: string, sessionId: string): Promise<void> {
        await this.db.collection<UserDocument>("users").updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { sessions: { _id: new ObjectId(sessionId) } } }
        );
    }

    // Mettre à jour les stats d'un workout après cancel ou delete
    // (timesUsed décrémenté, lastUsedAt recalculé)
    async updateWorkoutStats(
        userId: string,
        workoutId: string,
        timesUsed: number,
        lastUsedAt: Date | null
    ): Promise<void> {
        await this.db.collection("users").updateOne(
            { _id: new ObjectId(userId), "workouts._id": new ObjectId(workoutId) },
            {
                $set: {
                    "workouts.$.timesUsed": timesUsed,
                    "workouts.$.lastUsedAt": lastUsedAt,
                },
            }
        );
    }
}
