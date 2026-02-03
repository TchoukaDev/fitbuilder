// Affiche les statistiques globales des séances (total, terminées, en cours, planifiées).
export default function SessionStats({ stats }: { stats: { total: number; completed: number; inProgress: number; planned: number } }) {

  const statsConfig = [
    {
      label: "Total",
      value: stats.total,
      bgColor: "bg-gray-100",
      borderColor: "border-gray-300",
      textColor: "text-gray-700",
      valueColor: "text-gray-900",
    },
    {
      label: "Terminées",
      value: stats.completed,
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      textColor: "text-green-700",
      valueColor: "text-green-900",
    },
    {
      label: "En cours",
      value: stats.inProgress,
      bgColor: "bg-accent-100",
      borderColor: "border-accent-300",
      textColor: "text-accent-700",
      valueColor: "text-accent-900",
    },
    {
      label: "Planifiées",
      value: stats.planned,
      bgColor: "bg-primary-100",
      borderColor: "border-primary-300",
      textColor: "text-primary-700",
      valueColor: "text-primary-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {statsConfig.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-3 md:p-4`}
        >
          <p className={`text-xs md:text-sm ${stat.textColor} font-medium`}>
            {stat.label}
          </p>
          <p className={`text-xl md:text-2xl font-bold ${stat.valueColor}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
