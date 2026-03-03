import { describe, it, expect, beforeEach } from "vitest";
import { useSessionStore } from "../sessionStore";
import { SessionExercise } from "@/types/SessionExercise";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSet(completed = false, reps = 10, weight = 50) {
    return { completed, reps, weight };
}

function makeExercise(overrides: Partial<SessionExercise> = {}): SessionExercise {
    return {
        exerciseId: "ex-1",
        exerciseName: "Squat",
        order: 0,
        targetSets: 3,
        targetReps: 10,
        targetWeight: 80,
        restTime: 90,
        actualSets: [makeSet(), makeSet(), makeSet()],
        notes: "",
        effort: null,
        completed: false,
        ...overrides,
    };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

// Remet le store à l'état initial avant chaque test
beforeEach(() => {
    useSessionStore.setState({
        exercises: [],
        currentExerciseIndex: 0,
        isSaving: false,
    });
});

// Raccourci pour lire l'état et appeler les actions
const getState = () => useSessionStore.getState();

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("sessionStore", () => {

    describe("completeExercise", () => {

        it("marque l'exercice comme complété", () => {
            useSessionStore.setState({ exercises: [makeExercise()] });

            getState().completeExercise(0);

            expect(getState().exercises[0].completed).toBe(true);
        });

        it("remet weight et reps à 0 sur les séries non complétées", () => {
            const exercise = makeExercise({
                actualSets: [
                    makeSet(true, 10, 80),   // complétée → inchangée
                    makeSet(false, 8, 60),   // non complétée → reset
                ],
            });
            useSessionStore.setState({ exercises: [exercise] });

            getState().completeExercise(0);

            const sets = getState().exercises[0].actualSets;
            expect(sets[0].weight).toBe(80); // inchangée
            expect(sets[0].reps).toBe(10);   // inchangée
            expect(sets[1].weight).toBe(0);  // reset
            expect(sets[1].reps).toBe(0);    // reset
        });

        it("avance à l'exercice suivant si possible", () => {
            useSessionStore.setState({
                exercises: [makeExercise(), makeExercise()],
                currentExerciseIndex: 0,
            });

            getState().completeExercise(0);

            expect(getState().currentExerciseIndex).toBe(1);
        });

        it("reste sur l'index courant si c'est le dernier exercice", () => {
            useSessionStore.setState({
                exercises: [makeExercise()],
                currentExerciseIndex: 0,
            });

            getState().completeExercise(0);

            expect(getState().currentExerciseIndex).toBe(0);
        });

    });

    describe("reopenExercise", () => {

        it("remet completed à false", () => {
            useSessionStore.setState({
                exercises: [makeExercise({ completed: true })],
            });

            getState().reopenExercise(0);

            expect(getState().exercises[0].completed).toBe(false);
        });

        it("repositionne currentExerciseIndex sur l'exercice rouvert", () => {
            useSessionStore.setState({
                exercises: [makeExercise({ completed: true }), makeExercise()],
                currentExerciseIndex: 1,
            });

            getState().reopenExercise(0);

            expect(getState().currentExerciseIndex).toBe(0);
        });

    });

    describe("toggleExerciseSetComplete", () => {

        it("passe completed de false à true", () => {
            useSessionStore.setState({ exercises: [makeExercise()] });

            getState().toggleExerciseSetComplete(0, 0);

            expect(getState().exercises[0].actualSets[0].completed).toBe(true);
        });

        it("passe completed de true à false", () => {
            useSessionStore.setState({
                exercises: [makeExercise({ actualSets: [makeSet(true)] })],
            });

            getState().toggleExerciseSetComplete(0, 0);

            expect(getState().exercises[0].actualSets[0].completed).toBe(false);
        });

    });

    describe("updateExerciseSet", () => {

        it("met à jour le poids d'une série", () => {
            useSessionStore.setState({ exercises: [makeExercise()] });

            getState().updateExerciseSet(0, 0, "weight", 100);

            expect(getState().exercises[0].actualSets[0].weight).toBe(100);
        });

        it("met à jour les reps d'une série", () => {
            useSessionStore.setState({ exercises: [makeExercise()] });

            getState().updateExerciseSet(0, 0, "reps", 12);

            expect(getState().exercises[0].actualSets[0].reps).toBe(12);
        });

    });

    describe("updateExerciseEffort", () => {

        it("met à jour l'effort RPE", () => {
            useSessionStore.setState({ exercises: [makeExercise()] });

            getState().updateExerciseEffort(0, 8);

            expect(getState().exercises[0].effort).toBe(8);
        });

        it("accepte null pour effacer l'effort", () => {
            useSessionStore.setState({
                exercises: [makeExercise({ effort: 7 })],
            });

            getState().updateExerciseEffort(0, null);

            expect(getState().exercises[0].effort).toBeNull();
        });

    });

    describe("updateExerciseNotes", () => {

        it("met à jour les notes d'un exercice", () => {
            useSessionStore.setState({ exercises: [makeExercise()] });

            getState().updateExerciseNotes(0, "Attention au dos");

            expect(getState().exercises[0].notes).toBe("Attention au dos");
        });

    });

});
