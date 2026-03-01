import { Exercise, ExerciseDB } from "@/types/exercise";
import { UserDocument } from "@/types/user";
import { Db, ObjectId } from "mongodb";

export class ExerciseRepository {
    constructor(private readonly db: Db) { }


    async findAllPublic(): Promise<Exercise[] | null> {
        const exercises = await this.db.collection("exercises").find({ isPublic: true }).sort({ muscle: 1, name: 1 }).toArray()
        if (!exercises) return null
        return exercises.map(({ _id, ...e }) => ({ ...e, exerciseId: _id.toString() })) as Exercise[] ?? []
    }

    async findAllPrivate(userId: string): Promise<Exercise[] | null> {
        const user = await this.db.collection("users").findOne({ _id: new ObjectId(userId) })
        if (!user) return null
        const sorted = (user.exercises ?? []).sort((a: ExerciseDB, b: ExerciseDB) =>
            a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name)
        )
        return sorted.map(({ _id, ...e }: ExerciseDB) => ({ ...e, exerciseId: _id.toString() }))
    }

    async findPublicById(exerciseId: string): Promise<Exercise | null> {
        const exercise = await this.db.collection("exercises").findOne({ _id: new ObjectId(exerciseId) })
        if (!exercise) return null
        const { _id, ...rest } = exercise as ExerciseDB
        return {
            ...rest,
            exerciseId: _id.toString(),

        }
    }

    async findPrivateById(userId: string, exerciseId: string): Promise<Exercise | null> {
        const user = await this.db.collection("users").findOne({ _id: new ObjectId(userId) })
        if (!user) return null
        const exercise = user.exercises.find((e: ExerciseDB) => e._id.toString() === exerciseId)
        if (!exercise) return null
        const { _id, ...rest } = exercise
        return {
            exerciseId: _id.toString(),
            ...rest
        }
    }

    async createPublic(data: { name: string, muscle: string, description: string | null, equipment: string }): Promise<Exercise> {
        const { name, muscle, description, equipment } = data

        const insertResult = await this.db.collection("exercises").insertOne({
            name, muscle, description, equipment, isPublic: true, createdAt: new Date()
        })

        return {
            exerciseId: insertResult.insertedId.toString(),
            name,
            muscle, description, equipment, isPublic: true,
            createdAt: new Date()
        }
    }

    async createPrivate(userId: string, data: { name: string, muscle: string, description: string | null, equipment: string }): Promise<Exercise | null> {
        const { name, muscle, description, equipment } = data
        const exerciseId = new ObjectId()
        const newExercise = { _id: exerciseId, name, muscle, description, equipment, isPublic: false, createdAt: new Date() }

        await this.db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId) }, { $push: { exercises: newExercise } })

        const { _id, ...rest } = newExercise
        return {
            exerciseId: _id.toString(),
            ...rest
        }
    }

    async updatePublic(exerciseId: string, data: { name: string, muscle: string, description: string | null, equipment: string }): Promise<Exercise | null> {
        const { name, muscle, description, equipment } = data
        const exercise = await this.findPublicById(exerciseId)
        if (!exercise) return null
        await this.db.collection("exercises").updateOne({ _id: new ObjectId(exerciseId) }, { $set: { name, muscle, description, equipment } })

        return {
            exerciseId,
            name,
            muscle, description, equipment,
            createdAt: exercise.createdAt,
            isPublic: exercise.isPublic
        }
    }

    async updatePrivate(userId: string, exerciseId: string, data: { name: string, muscle: string, description: string | null, equipment: string }): Promise<Exercise | null> {
        const { name, muscle, description, equipment } = data
        const exercise = await this.findPrivateById(userId, exerciseId)
        if (!exercise) return null
        await this.db.collection("users").updateOne({ _id: new ObjectId(userId), "exercises._id": new ObjectId(exerciseId) }, {
            $set: {
                "exercises.$.name": name,
                "exercises.$.muscle": muscle,
                "exercises.$.equipment": equipment,
                "exercises.$.description": description,
            }
        })
        return {
            exerciseId,
            name,
            muscle,
            equipment,
            description,
            isPublic: exercise.isPublic,
            createdAt: exercise.createdAt
        }
    }

    async deletePublic(exerciseId: string): Promise<void> {
        await this.db.collection("exercises").deleteOne({ _id: new ObjectId(exerciseId) })
    }

    async deletePrivate(userId: string, exerciseId: string): Promise<void> {
        await this.db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId) },
            { $pull: { exercises: { _id: new ObjectId(exerciseId) } } })
    }

    async findAllFavorites(userId: string): Promise<string[] | null> {
        const user = await this.db.collection("users").findOne({ _id: new ObjectId(userId) }, {
            projection: {
                favoritesExercises: 1
            }
        })
        if (!user) return null
        return user.favoritesExercises || []

    }

    async addFavorite(userId: string, exerciseId: string): Promise<string[] | null> {
        await this.db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId) }, {
            $addToSet: { favoritesExercises: exerciseId }
        })
        const favoritesExercise = await this.findAllFavorites(userId)
        return favoritesExercise || []
    }


    async removeFavorite(userId: string, exerciseId: string): Promise<string[] | null> {
        await this.db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId) }, {
            $pull: {
                favoritesExercises: exerciseId
            }
        })
        const favorites = await this.findAllFavorites(userId)
        return favorites
    }

}