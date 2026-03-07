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
      label: "Mes exercices",
      count: counts.mine,
    },
    {
      id: "favorites",
      label: "Favoris",
      count: counts.favorites,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`py-1.5 px-3 border-none rounded-md cursor-pointer text-xs font-semibold ${activeTab === tab.id
              ? "bg-primary-500 text-white"
              : "bg-primary-50 text-primary-800"
            }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
