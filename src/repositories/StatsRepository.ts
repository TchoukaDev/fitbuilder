import { UserDocument } from "@/types/user";
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
        const user = await this.db.collection<UserDocument>("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { sessions: 1, workouts: 1, exercises: 1 } }
        );
        if (!user) return null;

        return {
            sessions: user.sessions ?? [],
            workouts: user.workouts ?? [],
            exercisesCount: (user.exercises ?? []).length,
        };
    }
}
