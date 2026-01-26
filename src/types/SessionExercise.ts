export type SessionExercise = {
    actualSets: ActualSet[],
    completed: boolean,
    effort: number | null,
    exerciseId: string,
    exerciseName: string,
    notes?: string
    order: number,
    restTime: number
    targetReps: number,
    targetSets: number,
    targetWeight: number
}

export type ActualSet = {
    reps?: number,
    weight?: number,
    completed: boolean | false
}