import { ExerciseDocument } from "@/models/ExerciseDocument";
import { UserDocument } from "@/models/UserDocument";
import { Exercise } from "@/types/exercise";
import { Db, ObjectId } from "mongodb";

export class ExerciseRepository {
    constructor(private readonly db: Db) { }

    private toExercise({ _id, userId, ...rest }: ExerciseDocument): Exercise {
        return { ...rest, exerciseId: _id.toString() };
    }

    // ─── READ ────────────────────────────────────────────────────────────────────

    async findAllPublic(): Promise<Exercise[] | null> {
        const docs = await this.db
            .collection<ExerciseDocument>("exercises")
            .find({ userId: null })
            .sort({ primary_muscle: 1, name: 1 })
            .toArray();
        return docs.map((d) => this.toExercise(d));
    }

    async findAllPrivate(userId: string): Promise<Exercise[] | null> {
        const docs = await this.db
            .collection<ExerciseDocument>("exercises")
            .find({ userId: new ObjectId(userId) })
            .sort({ primary_muscle: 1, name: 1 })
            .toArray();
        return docs.map((d) => this.toExercise(d));
    }

    async findPublicById(exerciseId: string): Promise<Exercise | null> {
        const doc = await this.db
            .collection<ExerciseDocument>("exercises")
            .findOne({ _id: new ObjectId(exerciseId), userId: null });
        if (!doc) return null;
        return this.toExercise(doc);
    }

    async findPrivateById(userId: string, exerciseId: string): Promise<Exercise | null> {
        const doc = await this.db
            .collection<ExerciseDocument>("exercises")
            .findOne({ _id: new ObjectId(exerciseId), userId: new ObjectId(userId) });
        if (!doc) return null;
        return this.toExercise(doc);
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────────

    async createPublic(data: { name: string; primary_muscle: string; secondary_muscles: string[]; description: string | null; equipment: string }): Promise<Exercise> {
        const doc: ExerciseDocument = {
            _id: new ObjectId(),
            userId: null,
            name: data.name,
            primary_muscle: data.primary_muscle,
            secondary_muscles: data.secondary_muscles,
            description: data.description,
            equipment: data.equipment,
            isPublic: true,
            createdAt: new Date(),
        };
        await this.db.collection<ExerciseDocument>("exercises").insertOne(doc);
        return this.toExercise(doc);
    }

    async createPrivate(userId: string, data: { name: string; primary_muscle: string; secondary_muscles: string[]; description: string | null; equipment: string }): Promise<Exercise> {
        const doc: ExerciseDocument = {
            _id: new ObjectId(),
            userId: new ObjectId(userId),
            name: data.name,
            primary_muscle: data.primary_muscle,
            secondary_muscles: data.secondary_muscles,
            description: data.description,
            equipment: data.equipment,
            isPublic: false,
            createdAt: new Date(),
        };
        await this.db.collection<ExerciseDocument>("exercises").insertOne(doc);
        return this.toExercise(doc);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────────

    async updatePublic(exerciseId: string, data: { name: string; primary_muscle: string; secondary_muscles: string[]; description: string | null; equipment: string }): Promise<Exercise | null> {
        await this.db.collection<ExerciseDocument>("exercises").updateOne(
            { _id: new ObjectId(exerciseId), userId: null },
            { $set: { name: data.name, primary_muscle: data.primary_muscle, secondary_muscles: data.secondary_muscles, description: data.description, equipment: data.equipment } }
        );
        return this.findPublicById(exerciseId);
    }

    async updatePrivate(userId: string, exerciseId: string, data: { name: string; primary_muscle: string; secondary_muscles: string[]; description: string | null; equipment: string }): Promise<Exercise | null> {
        await this.db.collection<ExerciseDocument>("exercises").updateOne(
            { _id: new ObjectId(exerciseId), userId: new ObjectId(userId) },
            { $set: { name: data.name, primary_muscle: data.primary_muscle, secondary_muscles: data.secondary_muscles, description: data.description, equipment: data.equipment } }
        );
        return this.findPrivateById(userId, exerciseId);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────────

    async deletePublic(exerciseId: string): Promise<void> {
        await this.db.collection<ExerciseDocument>("exercises").deleteOne({
            _id: new ObjectId(exerciseId),
            userId: null,
        });
    }

    async deletePrivate(userId: string, exerciseId: string): Promise<void> {
        await this.db.collection<ExerciseDocument>("exercises").deleteOne({
            _id: new ObjectId(exerciseId),
            userId: new ObjectId(userId),
        });
    }

    // ─── FAVORITES ───────────────────────────────────────────────────────────────

    async findAllFavorites(userId: string): Promise<string[] | null> {
        const user = await this.db
            .collection<UserDocument>("users")
            .findOne({ _id: new ObjectId(userId) }, { projection: { favoritesExercises: 1 } });
        if (!user) return null;
        return user.favoritesExercises ?? [];
    }

    async addFavorite(userId: string, exerciseId: string): Promise<string[] | null> {
        await this.db.collection<UserDocument>("users").updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { favoritesExercises: exerciseId } }
        );
        return this.findAllFavorites(userId);
    }

    async removeFavorite(userId: string, exerciseId: string): Promise<string[] | null> {
        await this.db.collection<UserDocument>("users").updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { favoritesExercises: exerciseId } }
        );
        return this.findAllFavorites(userId);
    }
}
