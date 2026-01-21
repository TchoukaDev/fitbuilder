type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: number | null;
  trendLabel: string | null;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
}: StatCardProps) {
  return (
    <div
      className={`
      bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg border-gray-200 hover:border-gray-300`}
    >
      {/* Header avec icône */}
      <div className="flex flex-col items-center justify-evenly gap-2 h-full">
        <span className="text-3xl">{icon}</span>
        {/* Titre */}
        <h3 className="text-sm font-medium text-center text-gray-600 ">
          {title}
        </h3>
        {/* Valeur principale */}
        <p className="text-3xl font-bold text-gray-900 text-center ">{value}</p>
        {/* Sous-titre */}
        {subtitle && (
          <p className="text-sm text-center text-gray-500">{subtitle}</p>
        )}
        {trend && trendLabel && (
          <p
            className={`text-xs text-center font-semibold px-2 py-1 rounded ${
              trend >= 70
                ? "bg-green-100 text-green-700"
                : trend >= 50
                ? "bg-orange-100 text-orange-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trendLabel}
          </p>
        )}{" "}
      </div>
    </div>
  );
}
