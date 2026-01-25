export type WorkoutExercise = {
    exerciseId: string;
    name: string;
    sets: number;
    reps: number; // number (ex: 10)
    targetWeight: number;
    restTime: number;
    notes: string | null;
    effort: number | null;
    order: number;
}