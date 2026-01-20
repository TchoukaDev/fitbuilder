// Onglets de navigation pour filtrer les exercices (Tous / Mes exercices / Favoris)

type ExerciseTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: { all: number; mine: number; favorites: number };
  setSelectedMuscle: (muscle: string) => void;
}

export default function ExerciseTabs({
  activeTab,
  onTabChange,
  counts,
  setSelectedMuscle,
}: ExerciseTabsProps) {
  const tabs = [
    { id: "all", label: "Tous", count: counts.all },
    {
      id: "mine",
      label: "Mes exercices personnalisés",
      count: counts.mine,
    },
    {
      id: "favorites",
      label: "⭐ Favoris",
      count: counts.favorites,
    },
  ];

  return (
    <div className="flex gap-2.5 mb-8 border-b-2 border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            onTabChange(tab.id);
            setSelectedMuscle("all");
          }}
          className={`py-2 md:py-4 px-4 md:px-8 bg-transparent border-b ${
            activeTab === tab.id
              ? "border-b-[3px] border-primary-500 font-bold"
              : "font-normal border-transparent"
          } cursor-pointer transition-all`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
