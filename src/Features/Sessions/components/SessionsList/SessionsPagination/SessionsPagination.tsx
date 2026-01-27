// Composant de pagination pour naviguer entre les pages de séances.
import { ChevronLeft, ChevronRight } from "lucide-react";
import RenderPageNumbers from "./renderPageNumbers/renderPageNumbers";

interface SessionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isFetching: boolean;
}
export default function SessionsPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isFetching,
}: SessionsPaginationProps) {
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
          className="flex items-center gap-1 px-4 py-2 rounded-lg shadow cursor-pointer font-medium transition bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed text-primary-50"
        >
          <ChevronLeft size={18} />
          <span className=" hidden md:block">Précédent</span>
        </button>

        {/* Numéros de pages */}
        <div className="flex gap-1">
          <RenderPageNumbers currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} isFetching={isFetching} />
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isFetching}
          className="flex items-center gap-1 px-4 py-2 rounded-lg shadow cursor-pointer font-medium transition bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed text-primary-50"
        >
          <span className=" hidden md:block">Suivant</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
