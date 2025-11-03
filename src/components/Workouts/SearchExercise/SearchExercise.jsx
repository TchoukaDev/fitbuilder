import Label from "@/components/Forms/FormsComponents/Label/Label";

export default function SearchExercise({ onSearchChange, search }) {
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
          onSearchChange(e.target.value);
        }}
      />
      <Label htmlFor="search" value={search}>
        Rechercher
      </Label>
    </div>
  );
}
