// components/StatusBadge/StatusBadge.jsx

export default function StatusBadge({ status }) {
  const config = {
    planned: {
      label: "Planifiée",
      color: "bg-primary-100 text-primary-800",
      icon: "📅",
    },
    "in-progress": {
      label: "En cours",
      color: "bg-accent-100 text-accent-800",
      icon: "⏳",
    },
    completed: {
      label: "Terminée",
      color: "bg-green-100 text-green-800",
      icon: "✅",
    },
  };

  const { label, color, icon } = config[status] || config.planned;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {icon} {label}
    </span>
  );
}
