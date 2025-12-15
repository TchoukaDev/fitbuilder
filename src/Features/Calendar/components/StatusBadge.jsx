// components/StatusBadge/StatusBadge.jsx
import { Calendar, Clock, CheckCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  const config = {
    planned: {
      label: "planifiée",
      color: "bg-primary-100 text-primary-800 border-primary-300 border",
      icon: <Calendar size={16} />,
    },
    "in-progress": {
      label: "en cours",
      color: "bg-accent-100 text-accent-800 border-accent-300 border",
      icon: <Clock size={16} />,
    },
    completed: {
      label: "terminée",
      color: "bg-green-100 text-green-800 border-green-300 border",
      icon: <CheckCircle size={16} />,
    },
  };

  const { label, color, icon } = config[status] || config.planned;

  return (
    <span
      className={`flex items-center gap-2 px-3 py-1 w-fit rounded-full text-sm font-medium ${color}`}
    >
      {icon} Séance {label}
    </span>
  );
}
