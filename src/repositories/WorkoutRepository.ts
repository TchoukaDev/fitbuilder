import { WorkoutDocument } from "@/models/WorkoutDocument";
import { Workout } from "@/types/workout";
import { WorkoutExercise } from "@/types/workoutExercise";
import { Db, ObjectId } from "mongodb";

export class WorkoutRepository {
    constructor(private readonly db: Db) { }

    private toWorkout({ _id, userId, ...rest }: WorkoutDocument): Workout {
        return { ...rest, id: _id.toString() };
    }

    async findAll(userId: string): Promise<Workout[] | null> {
        const docs = await this.db
            .collection<WorkoutDocument>("workouts")
            .find({ userId: new ObjectId(userId) })
            .toArray();
        return docs.map((d) => this.toWorkout(d));
    }

    async findById(userId: string, workoutId: string): Promise<Workout | null> {
        const doc = await this.db
            .collection<WorkoutDocument>("workouts")
            .findOne({ _id: new ObjectId(workoutId), userId: new ObjectId(userId) });
        if (!doc) return null;
        return this.toWorkout(doc);
    }

    async create(userId: string, data: {
        name: string; description: string; category: string; estimatedDuration: number; exercises: WorkoutExercise[];
    }): Promise<Workout> {
        const doc: WorkoutDocument = {
            _id: new ObjectId(),
            userId: new ObjectId(userId),
            name: data.name,
            description: data.description,
            category: data.category,
            estimatedDuration: data.estimatedDuration,
            exercises: data.exercises,
            timesUsed: 0,
            lastUsedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.db.collection<WorkoutDocument>("workouts").insertOne(doc);
        return this.toWorkout(doc);
    }

    async update(userId: string, workoutId: string, data: {
        name: string; description: string; category: string; estimatedDuration: number; exercises: WorkoutExercise[];
    }): Promise<Workout | null> {
        await this.db.collection<WorkoutDocument>("workouts").updateOne(
            { _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
            {
                $set: {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    estimatedDuration: data.estimatedDuration,
                    exercises: data.exercises,
                    updatedAt: new Date(),
                },
            }
        );
        return this.findById(userId, workoutId);
    }

    async delete(userId: string, workoutId: string): Promise<void> {
        await this.db.collection<WorkoutDocument>("workouts").deleteOne({
            _id: new ObjectId(workoutId),
            userId: new ObjectId(userId),
        });
    }
}
