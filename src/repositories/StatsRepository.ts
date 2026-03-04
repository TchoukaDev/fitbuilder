import { SessionDocument } from "@/models/SessionDocument";
import { WorkoutDocument } from "@/models/WorkoutDocument";
import { WorkoutDB } from "@/types/workout";
import { WorkoutSessionDB } from "@/types/workoutSession";
import { Db, ObjectId } from "mongodb";

type UserStatsData = {
    sessions: WorkoutSessionDB[];
    workouts: WorkoutDB[];
    exercisesCount: number;
};

export class StatsRepository {
    constructor(private readonly db: Db) { }

    async findUserStats(userId: string): Promise<UserStatsData | null> {
        const userObjectId = new ObjectId(userId);

        const [sessions, workouts, exercisesCount] = await Promise.all([
            this.db.collection<SessionDocument>("sessions").find({ userId: userObjectId }).toArray(),
            this.db.collection<WorkoutDocument>("workouts").find({ userId: userObjectId }).toArray(),
            this.db.collection("exercises").countDocuments({ userId: userObjectId }),
        ]);

        return {
            sessions: sessions as unknown as WorkoutSessionDB[],
            workouts: workouts as unknown as WorkoutDB[],
            exercisesCount,
        };
    }
}
