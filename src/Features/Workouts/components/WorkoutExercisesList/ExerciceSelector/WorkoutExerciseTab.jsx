export default function WorkoutExerciseTabs({ onTabChange, counts }) {
  const tabs = [
    { id: "all", label: "Tous", count: counts.all },
    {
      id: "mine",
      label: "Mes exercices personnalisés",
      count: counts.mine,
    },
    {
      id: "favorites",
      label: "Favoris",
      count: counts.favorites,
    },
  ];

  return (
    <div>
      <p className="text-center my-3">Filtrer par type d'exercice</p>
      <select
        className="input pt-2"
        onChange={(e) => onTabChange(e.target.value)}
      >
        {" "}
        {tabs.map((tab) => (
          <option value={tab.id} key={tab.id}>
            {tab.label} ({tab.count})
          </option>
        ))}
      </select>
    </div>
  );
}
