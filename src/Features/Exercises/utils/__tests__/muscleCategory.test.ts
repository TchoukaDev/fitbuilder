import { describe, expect, it } from "vitest"
import { getMuscleCategory } from "../muscleCategory"

describe("getMuscleCategory", () => {

    describe("Poitrine", () => {
        it.each(["Pectoraux supérieurs", "Pectoraux moyens", "Pectoraux inférieurs"])(
            "catégorise '%s' → 'Poitrine'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Poitrine")
            }
        )
    })

    describe("Dos", () => {
        it.each(["Grand dorsal", "Rhomboïdes", "Trapèzes", "Érecteurs du rachis"])(
            "catégorise '%s' → 'Dos'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Dos")
            }
        )
    })

    describe("Épaules", () => {
        it.each(["Deltoïde antérieur", "Deltoïde médial", "Deltoïde postérieur"])(
            "catégorise '%s' → 'Épaules'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Épaules")
            }
        )
    })

    describe("Bras", () => {
        it.each(["Biceps", "Triceps", "Avant-bras", "Brachialis"])(
            "catégorise '%s' → 'Bras'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Bras")
            }
        )
    })

    describe("Jambes", () => {
        it.each(["Quadriceps", "Ischio-jambiers", "Adducteurs", "Mollets"])(
            "catégorise '%s' → 'Jambes'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Jambes")
            }
        )
    })

    describe("Fessiers", () => {
        it.each(["Grand fessier", "Moyen fessier"])(
            "catégorise '%s' → 'Fessiers'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Fessiers")
            }
        )
    })

    describe("Core", () => {
        it.each(["Abdominaux", "Obliques", "Core profond"])(
            "catégorise '%s' → 'Core'", (muscle) => {
                expect(getMuscleCategory(muscle)).toBe("Core")
            }
        )
    })

    describe("Autre", () => {
        it("catégorise 'Corps entier' → 'Autre'", () => {
            expect(getMuscleCategory("Corps entier")).toBe("Autre")
        })
    })

    describe("fallback", () => {
        it("retourne le muscle tel quel si inconnu", () => {
            expect(getMuscleCategory("Muscle inconnu")).toBe("Muscle inconnu")
        })

        it("retourne une chaîne vide telle quelle", () => {
            expect(getMuscleCategory("")).toBe("")
        })
    })

})

describe("groupement par catégorie (logique pure)", () => {
    type Ex = { name: string; primary_muscle: string }

    function groupByCategory(exercises: Ex[]): Record<string, Ex[]> {
        return exercises.reduce<Record<string, Ex[]>>((acc, ex) => {
            const cat = getMuscleCategory(ex.primary_muscle)
            if (!acc[cat]) acc[cat] = []
            acc[cat].push(ex)
            return acc
        }, {})
    }

    it("groupe deux exercices pectoraux sous 'Poitrine'", () => {
        const exercises = [
            { name: "Développé couché", primary_muscle: "Pectoraux moyens" },
            { name: "Développé incliné", primary_muscle: "Pectoraux supérieurs" },
        ]
        const grouped = groupByCategory(exercises)
        expect(Object.keys(grouped)).toEqual(["Poitrine"])
        expect(grouped["Poitrine"]).toHaveLength(2)
    })

    it("sépare correctement plusieurs catégories", () => {
        const exercises = [
            { name: "Squat", primary_muscle: "Quadriceps" },
            { name: "Curl biceps", primary_muscle: "Biceps" },
            { name: "Tractions", primary_muscle: "Grand dorsal" },
        ]
        const grouped = groupByCategory(exercises)
        expect(grouped["Jambes"]).toHaveLength(1)
        expect(grouped["Bras"]).toHaveLength(1)
        expect(grouped["Dos"]).toHaveLength(1)
    })

    it("filtre par catégorie sélectionnée", () => {
        const exercises = [
            { name: "Squat", primary_muscle: "Quadriceps" },
            { name: "Curl biceps", primary_muscle: "Biceps" },
            { name: "Fentes", primary_muscle: "Quadriceps" },
        ]
        const selectedCategory = "Jambes"
        const filtered = exercises.filter(
            (ex) => getMuscleCategory(ex.primary_muscle) === selectedCategory
        )
        expect(filtered).toHaveLength(2)
        expect(filtered.map((e) => e.name)).toEqual(["Squat", "Fentes"])
    })

    it("retourne des catégories uniques triées", () => {
        const exercises = [
            { name: "Squat", primary_muscle: "Quadriceps" },
            { name: "Curl biceps", primary_muscle: "Biceps" },
            { name: "Fentes", primary_muscle: "Ischio-jambiers" },
            { name: "Tractions", primary_muscle: "Grand dorsal" },
        ]
        const categories = [...new Set(exercises.map((ex) => getMuscleCategory(ex.primary_muscle)))].sort()
        expect(categories).toEqual(["Bras", "Dos", "Jambes"])
    })

})
