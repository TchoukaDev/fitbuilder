import { describe, it, expect, beforeEach } from "vitest";
import { createWorkoutStore } from "../workoutStoreProvider";
import { WorkoutExercise } from "@/types/workoutExercise";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeExercise(name = "Squat", order = 1): WorkoutExercise {
    return {
        exerciseId: "ex-1",
        name,
        sets: 3,
        reps: 10,
        targetWeight: 80,
        restTime: 90,
        notes: null,
        order,
    };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

// Crée un store frais avant chaque test.
// autoSave: false pour ne pas appeler localStorage (environnement node).
let store: ReturnType<typeof createWorkoutStore>;

beforeEach(() => {
    store = createWorkoutStore();
    store.setState({ autoSave: false });
});

const getState = () => store.getState();

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("workoutStore", () => {

    describe("addExercise", () => {

        it("ajoute un exercice à la liste", () => {
            getState().addExercise(makeExercise("Squat"));

            expect(getState().exercises).toHaveLength(1);
            expect(getState().exercises[0].name).toBe("Squat");
        });

        it("assigne order = position dans la liste (1-indexé)", () => {
            getState().addExercise(makeExercise("Squat"));
            getState().addExercise(makeExercise("Bench"));

            expect(getState().exercises[0].order).toBe(1);
            expect(getState().exercises[1].order).toBe(2);
        });

    });

    describe("removeExercise", () => {

        it("supprime l'exercice à l'index donné", () => {
            store.setState({ exercises: [makeExercise("Squat"), makeExercise("Bench", 2)] });

            getState().removeExercise(0);

            expect(getState().exercises).toHaveLength(1);
            expect(getState().exercises[0].name).toBe("Bench");
        });

        it("recalcule l'order des exercices restants", () => {
            store.setState({
                exercises: [
                    makeExercise("Squat", 1),
                    makeExercise("Bench", 2),
                    makeExercise("Curl", 3),
                ],
            });

            getState().removeExercise(0); // supprime Squat

            expect(getState().exercises[0].order).toBe(1); // Bench → 1
            expect(getState().exercises[1].order).toBe(2); // Curl → 2
        });

    });

    describe("updateExercise", () => {

        it("met à jour l'exercice à l'index donné", () => {
            store.setState({ exercises: [makeExercise("Squat")] });

            getState().updateExercise(0, makeExercise("Squat modifié"));

            expect(getState().exercises[0].name).toBe("Squat modifié");
        });

        it("préserve l'order original lors de la mise à jour", () => {
            store.setState({ exercises: [makeExercise("Squat", 3)] });

            // On passe un exercice avec order = 1, mais le store doit conserver order = 3
            getState().updateExercise(0, makeExercise("Squat modifié", 1));

            expect(getState().exercises[0].order).toBe(3);
        });

    });

    describe("moveExercise", () => {

        it("monte un exercice vers le haut", () => {
            store.setState({
                exercises: [makeExercise("Squat", 1), makeExercise("Bench", 2)],
            });

            getState().moveExercise(1, "up");

            expect(getState().exercises[0].name).toBe("Bench");
            expect(getState().exercises[1].name).toBe("Squat");
        });

        it("descend un exercice vers le bas", () => {
            store.setState({
                exercises: [makeExercise("Squat", 1), makeExercise("Bench", 2)],
            });

            getState().moveExercise(0, "down");

            expect(getState().exercises[0].name).toBe("Bench");
            expect(getState().exercises[1].name).toBe("Squat");
        });

        it("ne fait rien si on monte le premier exercice", () => {
            store.setState({
                exercises: [makeExercise("Squat", 1), makeExercise("Bench", 2)],
            });

            getState().moveExercise(0, "up");

            expect(getState().exercises[0].name).toBe("Squat");
            expect(getState().exercises[1].name).toBe("Bench");
        });

        it("ne fait rien si on descend le dernier exercice", () => {
            store.setState({
                exercises: [makeExercise("Squat", 1), makeExercise("Bench", 2)],
            });

            getState().moveExercise(1, "down");

            expect(getState().exercises[0].name).toBe("Squat");
            expect(getState().exercises[1].name).toBe("Bench");
        });

        it("recalcule l'order après déplacement", () => {
            store.setState({
                exercises: [makeExercise("Squat", 1), makeExercise("Bench", 2), makeExercise("Curl", 3)],
            });

            getState().moveExercise(0, "down"); // Squat descend en position 2

            expect(getState().exercises[0].order).toBe(1);
            expect(getState().exercises[1].order).toBe(2);
            expect(getState().exercises[2].order).toBe(3);
        });

    });

});
