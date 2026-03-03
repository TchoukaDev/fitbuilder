import { beforeEach, describe, expect, it, vi } from "vitest"
import { SessionService } from "../SessionService"
import { WorkoutExercise } from "@/types/workoutExercise"
import { UnauthorizedError, ValidationError } from "@/libs/ServicesErrors"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeWorkoutExercise(sets: number, targetWeight: number): WorkoutExercise {
    return {
        exerciseId: "ex-1",
        name: "Squat",
        sets,
        reps: 10,
        targetWeight,
        restTime: 90,
        notes: null,
        order: 0,
    }
}

// Crée une WorkoutSession minimale (type applicatif, id = string)
function makeSession(overrides: Record<string, unknown> = {}) {
    return {
        id: "session-1",
        userId: "user-1",
        workoutId: "workout-1",
        workoutName: "Push",
        scheduledDate: new Date().toISOString(),
        status: "in-progress" as const,
        notes: null,
        effort: null,
        isPlanned: false,
        startedAt: new Date().toISOString(),
        completedDate: null,
        estimatedDuration: 60,
        duration: "00:00:00",
        exercises: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    }
}

// ─── Mock ────────────────────────────────────────────────────────────────────

const mockRepo = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    cancel: vi.fn(),
    delete: vi.fn(),
    updateWorkoutStats: vi.fn(),
    start: vi.fn(),
    save: vi.fn(),
    complete: vi.fn(),
    updatePlanned: vi.fn(),
}

// ─── Setup ───────────────────────────────────────────────────────────────────

let service: SessionService

beforeEach(() => {
    vi.clearAllMocks()
    service = new SessionService(mockRepo as any)
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("SessionService", () => {

    describe("create — guards", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.create("", {
                workoutId: "w1", workoutName: "Push",
                exercises: [makeWorkoutExercise(3, 80)],
                isPlanning: false,
            })).rejects.toThrow(UnauthorizedError)
        })

        it("lève ValidationError si workoutId est vide", async () => {
            await expect(service.create("user-1", {
                workoutId: "", workoutName: "Push",
                exercises: [makeWorkoutExercise(3, 80)],
                isPlanning: false,
            })).rejects.toThrow(ValidationError)
        })

        it("lève ValidationError si la liste d'exercices est vide", async () => {
            await expect(service.create("user-1", {
                workoutId: "w1", workoutName: "Push",
                exercises: [],
                isPlanning: false,
            })).rejects.toThrow(ValidationError)
        })

    })

    describe("buildSessionExercises — via create", () => {

        beforeEach(() => {
            // create retourne un id de session — nécessaire pour ne pas planter
            mockRepo.create.mockResolvedValue("session-id-123")
        })

        it("initialise le bon nombre d'actualSets", async () => {
            await service.create("user-1", {
                workoutId: "w1", workoutName: "Push",
                exercises: [makeWorkoutExercise(3, 80)],
                isPlanning: true,
            })

            const data = mockRepo.create.mock.calls[0][1]
            expect(data.exercises[0].actualSets).toHaveLength(3)
        })

        it("initialise chaque série avec weight = targetWeight et completed = false", async () => {
            await service.create("user-1", {
                workoutId: "w1", workoutName: "Push",
                exercises: [makeWorkoutExercise(3, 80)],
                isPlanning: true,
            })

            const data = mockRepo.create.mock.calls[0][1]
            for (const set of data.exercises[0].actualSets) {
                expect(set.weight).toBe(80)
                expect(set.completed).toBe(false)
            }
        })

        it("utilise restTime = 90 par défaut si non fourni", async () => {
            const exercise = { ...makeWorkoutExercise(3, 80), restTime: undefined }
            await service.create("user-1", {
                workoutId: "w1", workoutName: "Push",
                exercises: [exercise as any],
                isPlanning: true,
            })

            const data = mockRepo.create.mock.calls[0][1]
            expect(data.exercises[0].restTime).toBe(90)
        })

    })

    describe("cancel", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.cancel("", "session-1")).rejects.toThrow(UnauthorizedError)
        })

        it("lève ValidationError si la session n'est pas in-progress", async () => {
            mockRepo.findById.mockResolvedValue(makeSession({ status: "planned" }))
            await expect(service.cancel("user-1", "session-1")).rejects.toThrow(ValidationError)
        })

    })

    describe("computeWorkoutStatsAfterRemoval — via cancel", () => {

        // Raccourci pour lire les arguments passés à mockRepo.cancel
        // cancel(userId, sessionId, workoutId, timesUsed, lastUsedAt)
        //         [0]     [1]        [2]         [3]        [4]
        function getCancelArgs() {
            return mockRepo.cancel.mock.calls[0]
        }

        beforeEach(() => {
            // La session à annuler est toujours in-progress sur workout-1
            mockRepo.findById.mockResolvedValue(
                makeSession({ id: "session-1", status: "in-progress", workoutId: "workout-1" })
            )
        })

        it("timesUsed = 0 et lastUsedAt = null si aucune autre session complétée", async () => {
            mockRepo.findAll.mockResolvedValue([])

            await service.cancel("user-1", "session-1")

            const args = getCancelArgs()
            expect(args[3]).toBe(0)       // timesUsed
            expect(args[4]).toBeNull()    // lastUsedAt
        })

        it("timesUsed = nombre de sessions complétées restantes pour ce workout", async () => {
            mockRepo.findAll.mockResolvedValue([
                makeSession({ id: "session-2", status: "completed", workoutId: "workout-1", completedDate: "2025-01-01T00:00:00.000Z" }),
                makeSession({ id: "session-3", status: "completed", workoutId: "workout-1", completedDate: "2025-01-02T00:00:00.000Z" }),
            ])

            await service.cancel("user-1", "session-1")

            expect(getCancelArgs()[3]).toBe(2)
        })

        it("lastUsedAt = la date de la session complétée la plus récente", async () => {
            mockRepo.findAll.mockResolvedValue([
                makeSession({ id: "session-2", status: "completed", workoutId: "workout-1", completedDate: "2025-01-01T00:00:00.000Z" }),
                makeSession({ id: "session-3", status: "completed", workoutId: "workout-1", completedDate: "2025-03-01T00:00:00.000Z" }),
            ])

            await service.cancel("user-1", "session-1")

            expect(getCancelArgs()[4]).toEqual(new Date("2025-03-01T00:00:00.000Z"))
        })

        it("n'inclut pas les sessions d'un autre workout dans le comptage", async () => {
            mockRepo.findAll.mockResolvedValue([
                // workout-1 : 1 session complétée
                makeSession({ id: "session-2", status: "completed", workoutId: "workout-1", completedDate: "2025-01-01T00:00:00.000Z" }),
                // workout-2 : ne doit pas être compté
                makeSession({ id: "session-3", status: "completed", workoutId: "workout-2", completedDate: "2025-01-02T00:00:00.000Z" }),
            ])

            await service.cancel("user-1", "session-1")

            expect(getCancelArgs()[3]).toBe(1) // seulement workout-1
        })

    })

})
