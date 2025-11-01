import Label from "@/components/Forms/FormsComponents/Label/Label";
import { useEffect, useState } from "react";

export default function ExerciceSelector() {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState(initialExercises);
  const [foundedExercises, setFoundedExercises] = useState(initialExercises);

  useEffect(() => {
    const displayedExercises = exercises?.filter((ex) =>
      ex.name.includes(search?.toLowerCase()),
    );
    console.log(search);
    setExercises(displayedExercises), [search];
  });

  return (
    <div>
      <div className="relative">
        {/* Recherche */}
        <input
          className="input peer"
          name="search"
          id="search"
          placeholder=""
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Label htmlFor="search" value={search}>
          Rechercher
        </Label>
      </div>{" "}
      <select name="exercises" id="exercises">
        {exercises?.map((exercise) => (
          <option key={exercise._id}>{exercise.name}</option>
        ))}
      </select>
    </div>
  );
}
