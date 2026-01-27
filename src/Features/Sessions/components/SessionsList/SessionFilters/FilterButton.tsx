// Bouton de filtre réutilisable avec état actif

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  activeColor: string;
}
export default function FilterButton({
  label,
  isActive,
  onClick,
  disabled,
  activeColor = "primary",
}: FilterButtonProps) {
  const colorClasses = {
    primary: "bg-primary-600 text-white",
    green: "bg-green-600 text-white",
    accent: "bg-accent-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${isActive
          ? colorClasses[activeColor as keyof typeof colorClasses]
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}
