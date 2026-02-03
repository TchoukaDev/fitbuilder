// Sélecteur d'onglets pour filtrer les exercices (Tous / Mes exercices / Favoris).
interface WorkoutExerciseTabsProps {
  counts: Record<string, number>;
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function WorkoutExerciseTabs({
  counts,
  activeTab,
  onTabChange,
}: WorkoutExerciseTabsProps) {
  // Filtres
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
    <div className="flex flex-col text-center gap-2 mt-3">
      <label
        htmlFor="exerciseTab"
        className="text-sm text-primary-500 font-semibold"
      >
        Filtrer par type d'exercice:
      </label>
      <select
        className="input pt-2"
        onChange={(e) => onTabChange(e.target.value)}
        value={activeTab}
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
