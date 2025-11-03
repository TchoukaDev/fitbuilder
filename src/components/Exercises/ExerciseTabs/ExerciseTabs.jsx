export default function ExerciseTabs({
  activeTab,
  onTabChange,
  counts,
  inModal,
}) {
  const tabs = [
    { id: "all", label: "🏋️ Tous", count: counts.all },
    { id: "mine", label: "🗒️ Mes exercices personnalisés", count: counts.mine },
    { id: "favorites", label: "⭐ Favoris", count: counts.favorites },
  ];

  if (inModal)
    return (
      <select onChange={(e) => onTabChange(e.target.value)}>
        {" "}
        {tabs.map((tab) => (
          <option value={tab.id} key={tab.id}>
            {tab.label}({tab.count})
          </option>
        ))}
      </select>
    );

  return (
    <div className="flex gap-2.5 mb-8 border-b-2 border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 px-8 bg-transparent border-b ${
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
