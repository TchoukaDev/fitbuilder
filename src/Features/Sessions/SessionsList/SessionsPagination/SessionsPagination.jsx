// components/Features/Sessions/SessionsList/SessionsPagination.jsx

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SessionsPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isFetching,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Info pagination */}
      <div className="text-sm text-gray-600">
        Page {currentPage} sur {totalPages} • {totalItems} séance
        {totalItems > 1 ? "s" : ""}
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
            currentPage > 1 && !isFetching
              ? "bg-primary-600 text-white hover:bg-primary-700 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={18} />
          Précédent
        </button>

        {/* Numéros de pages */}
        <div className="flex gap-1">
          {renderPageNumbers(currentPage, totalPages, onPageChange, isFetching)}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isFetching}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
            currentPage < totalPages && !isFetching
              ? "bg-primary-600 text-white hover:bg-primary-700 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Suivant
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 HELPER - Rendu des numéros de pages
// ═══════════════════════════════════════════════════════
function renderPageNumbers(currentPage, totalPages, onPageChange, isFetching) {
  const pages = [];
  const maxVisible = 5;

  // Si peu de pages, afficher toutes
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PageButton
          key={i}
          pageNumber={i}
          isActive={currentPage === i}
          onClick={() => onPageChange(i)}
          disabled={isFetching}
        />,
      );
    }
    return pages;
  }

  // Logique pour beaucoup de pages
  pages.push(
    <PageButton
      key={1}
      pageNumber={1}
      isActive={currentPage === 1}
      onClick={() => onPageChange(1)}
      disabled={isFetching}
    />,
  );

  if (currentPage > 3) {
    pages.push(<Ellipsis key="ellipsis-left" />);
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(
      <PageButton
        key={i}
        pageNumber={i}
        isActive={currentPage === i}
        onClick={() => onPageChange(i)}
        disabled={isFetching}
      />,
    );
  }

  if (currentPage < totalPages - 2) {
    pages.push(<Ellipsis key="ellipsis-right" />);
  }

  pages.push(
    <PageButton
      key={totalPages}
      pageNumber={totalPages}
      isActive={currentPage === totalPages}
      onClick={() => onPageChange(totalPages)}
      disabled={isFetching}
    />,
  );

  return pages;
}

// ═══════════════════════════════════════════════════════
// 🔘 COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════
function PageButton({ pageNumber, isActive, onClick, disabled }) {
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

function Ellipsis() {
  return (
    <span className="w-10 h-10 flex items-center justify-center text-gray-400">
      ...
    </span>
  );
}
