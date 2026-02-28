import { UserDocument } from "@/types/user";
import { Workout, WorkoutDB } from "@/types/workout";
import { WorkoutExercise } from "@/types/workoutExercise";
import { Db, ObjectId } from "mongodb";

export class WorkoutRepository {
    constructor(private readonly db: Db) { }

    async findAll(userId: string): Promise<Workout[] | null> {
        const user = await this.db.collection("users").findOne({ _id: new ObjectId(userId) })
        if (!user) return null

        return (user.workouts ?? []).map(({ _id, ...w }: WorkoutDB) => ({ ...w, id: _id.toString() }))
    }

    async findById(userId: string, workoutId: string): Promise<Workout | null> {
        const user = await this.db.collection("users").findOne({ _id: new ObjectId(userId) })
        if (!user) return null
        const workout = user.workouts.find((w: WorkoutDB) => w._id.toString() === workoutId)
        if (!workout) return null
        const { _id, ...rest } = workout
        return { ...rest, id: _id.toString() }
    }

    async create(userId: string, data: {
        name: string; description: string; category: string; estimatedDuration: number; exercises:
        WorkoutExercise[]
    }): Promise<Workout> {
        const { name, description, category, estimatedDuration, exercises } = data
        // Création du plan
        const workoutId = new ObjectId();
        const newWorkout: WorkoutDB = {
            _id: workoutId,
            name,
            description,
            category,
            estimatedDuration,
            exercises,
            timesUsed: 0,
            lastUsedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await this.db.collection<UserDocument>("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $push: {
                    workouts:
                        newWorkout
                },
            }
        );
        const { _id, ...rest } = newWorkout
        return { id: _id.toString(), ...rest }
    }

    async update(userId: string, workoutId: string, data: {
        name: string; description: string; category: string; estimatedDuration: number; exercises:
        WorkoutExercise[]
    }): Promise<Workout | null> {
        const { name, description, category, estimatedDuration, exercises } = data
        await this.db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId), "workouts._id": new ObjectId(workoutId) },
            {
                $set: {
                    "workouts.$.name": name,
                    "workouts.$.category": category,
                    "workouts.$.estimatedDuration": estimatedDuration,
                    "workouts.$.description": description,
                    "workouts.$.exercises": exercises,
                    "workouts.$.updatedAt": new Date(),
                },
            })
        return this.findById(userId, workoutId)
    }

    async delete(userId: string, workoutId: string): Promise<void> {
        await this.db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId) }, { $pull: { workouts: { _id: new ObjectId(workoutId) } } })
    }

}