import { beforeEach, describe, expect, it, vi } from "vitest"
import { ExerciseService } from "../ExerciseService"
import { DuplicateError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/libs/ServicesErrors"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeExercise(name: string, exerciseId = "ex-1") {
    return { exerciseId, name, primary_muscle: "Pectoraux moyens", secondary_muscles: [], equipment: "Barre", description: null }
}

const exerciseData = { name: "Développé couché", primary_muscle: "Pectoraux moyens", secondary_muscles: [], equipment: "Barre", description: null }

// ─── Mock ────────────────────────────────────────────────────────────────────

const mockRepo = {
    findAllPublic: vi.fn(),
    findAllPrivate: vi.fn(),
    findPublicById: vi.fn(),
    findPrivateById: vi.fn(),
    createPublic: vi.fn(),
    createPrivate: vi.fn(),
    updatePublic: vi.fn(),
    updatePrivate: vi.fn(),
    deletePublic: vi.fn(),
    deletePrivate: vi.fn(),
    findAllFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
}

// ─── Setup ───────────────────────────────────────────────────────────────────

let service: ExerciseService

beforeEach(() => {
    vi.clearAllMocks()
    service = new ExerciseService(mockRepo as any)
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ExerciseService", () => {

    describe("getAll", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.getAll("")).rejects.toThrow(UnauthorizedError)
        })

        it("concatène les exercices publics et privés", async () => {
            mockRepo.findAllPublic.mockResolvedValue([makeExercise("Squat", "pub-1")])
            mockRepo.findAllPrivate.mockResolvedValue([makeExercise("Curl perso", "priv-1")])

            const result = await service.getAll("user-1")

            expect(result).toHaveLength(2)
            expect(result.map((e) => e.exerciseId)).toEqual(["pub-1", "priv-1"])
        })

    })

    describe("create", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.create("", false, exerciseData)).rejects.toThrow(UnauthorizedError)
        })

        describe("admin", () => {

            it("lève DuplicateError si un exercice public avec ce nom existe déjà", async () => {
                mockRepo.findAllPublic.mockResolvedValue([makeExercise("Développé couché")])
                await expect(service.create("admin-1", true, exerciseData)).rejects.toThrow(DuplicateError)
            })

            it("lève DuplicateError même si la casse est différente", async () => {
                mockRepo.findAllPublic.mockResolvedValue([makeExercise("développé couché")])
                await expect(service.create("admin-1", true, exerciseData)).rejects.toThrow(DuplicateError)
            })

            it("appelle createPublic (pas createPrivate)", async () => {
                mockRepo.findAllPublic.mockResolvedValue([])
                mockRepo.createPublic.mockResolvedValue(makeExercise("Développé couché"))

                await service.create("admin-1", true, exerciseData)

                expect(mockRepo.createPublic).toHaveBeenCalledOnce()
                expect(mockRepo.createPrivate).not.toHaveBeenCalled()
            })

        })

        describe("non-admin", () => {

            it("lève DuplicateError si un exercice privé avec ce nom existe déjà", async () => {
                mockRepo.findAllPrivate.mockResolvedValue([makeExercise("Développé couché")])
                await expect(service.create("user-1", false, exerciseData)).rejects.toThrow(DuplicateError)
            })

            it("appelle createPrivate (pas createPublic)", async () => {
                mockRepo.findAllPrivate.mockResolvedValue([])
                mockRepo.createPrivate.mockResolvedValue(makeExercise("Développé couché"))

                await service.create("user-1", false, exerciseData)

                expect(mockRepo.createPrivate).toHaveBeenCalledOnce()
                expect(mockRepo.createPublic).not.toHaveBeenCalled()
            })

        })

    })

    describe("update", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            mockRepo.findPublicById.mockResolvedValue(null)
            await expect(service.update("", "ex-1", false, exerciseData)).rejects.toThrow(UnauthorizedError)
        })

        it("lève ForbiddenError si un non-admin tente de modifier un exercice public", async () => {
            mockRepo.findPublicById.mockResolvedValue(makeExercise("Squat"))
            await expect(service.update("user-1", "ex-1", false, exerciseData)).rejects.toThrow(ForbiddenError)
        })

        it("autorise un admin à modifier un exercice public", async () => {
            mockRepo.findPublicById.mockResolvedValue(makeExercise("Squat"))
            mockRepo.updatePublic.mockResolvedValue(makeExercise("Squat modifié"))

            await expect(service.update("admin-1", "ex-1", true, exerciseData)).resolves.not.toThrow()
            expect(mockRepo.updatePublic).toHaveBeenCalledOnce()
        })

        it("lève NotFoundError si l'exercice privé est introuvable", async () => {
            mockRepo.findPublicById.mockResolvedValue(null)
            mockRepo.updatePrivate.mockResolvedValue(null)

            await expect(service.update("user-1", "ex-1", false, exerciseData)).rejects.toThrow(NotFoundError)
        })

    })

    describe("delete", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.delete("", "ex-1", false)).rejects.toThrow(UnauthorizedError)
        })

        it("lève ForbiddenError si un non-admin tente de supprimer un exercice public", async () => {
            mockRepo.findPublicById.mockResolvedValue(makeExercise("Squat"))
            await expect(service.delete("user-1", "ex-1", false)).rejects.toThrow(ForbiddenError)
        })

        it("autorise un admin à supprimer un exercice public", async () => {
            mockRepo.findPublicById.mockResolvedValue(makeExercise("Squat"))
            mockRepo.deletePublic.mockResolvedValue(undefined)

            await expect(service.delete("admin-1", "ex-1", true)).resolves.not.toThrow()
            expect(mockRepo.deletePublic).toHaveBeenCalledOnce()
        })

        it("lève NotFoundError si l'exercice privé est introuvable", async () => {
            mockRepo.findPublicById.mockResolvedValue(null)
            mockRepo.findPrivateById.mockResolvedValue(null)

            await expect(service.delete("user-1", "ex-1", false)).rejects.toThrow(NotFoundError)
        })

    })

    describe("toggleFavorite", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.toggleFavorite("", "ex-1", "add")).rejects.toThrow(UnauthorizedError)
        })

        it("lève NotFoundError si exerciseId est vide", async () => {
            await expect(service.toggleFavorite("user-1", "", "add")).rejects.toThrow(NotFoundError)
        })

        it("appelle addFavorite quand action = 'add'", async () => {
            mockRepo.addFavorite.mockResolvedValue(["ex-1"])

            await service.toggleFavorite("user-1", "ex-1", "add")

            expect(mockRepo.addFavorite).toHaveBeenCalledOnce()
            expect(mockRepo.removeFavorite).not.toHaveBeenCalled()
        })

        it("appelle removeFavorite quand action = 'remove'", async () => {
            mockRepo.removeFavorite.mockResolvedValue([])

            await service.toggleFavorite("user-1", "ex-1", "remove")

            expect(mockRepo.removeFavorite).toHaveBeenCalledOnce()
            expect(mockRepo.addFavorite).not.toHaveBeenCalled()
        })

    })

})
