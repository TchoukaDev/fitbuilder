// Champ de recherche pour filtrer les exercices par nom.
import { Label } from "@/Global/components";

export default function SearchExercise({ search, setSearch }) {
  return (
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
        Rechercher un exercice...
      </Label>
    </div>
  );
}
