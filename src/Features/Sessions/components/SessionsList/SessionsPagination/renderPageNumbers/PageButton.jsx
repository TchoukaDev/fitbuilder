// Bouton de numéro de page
export default function PageButton({
  pageNumber,
  isActive,
  onClick,
  disabled,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 rounded-lg font-medium transition ${
        isActive
          ? "bg-primary-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {pageNumber}
    </button>
  );
}
