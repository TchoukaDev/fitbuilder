// Composant de pagination pour naviguer entre les pages de séances.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { renderPageNumbers } from "./renderPageNumbers";

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
          <span className=" hidden md:block">Précédent</span>
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
          <span className=" hidden md:block">Suivant</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
