// Génère la liste des boutons de numéros de pages avec ellipses si nécessaire
import PageButton from "./PageButton";

export default function renderPageNumbers(
  currentPage,
  totalPages,
  onPageChange,
  isFetching,
) {
  const pages = [];
  const maxVisible = 5;

  // Afficher toutes les pages si peu nombreuses
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PageButton
          key={i}
          pageNumber={i}
          isActive={currentPage === i}
          onClick={() => onPageChange(i)}
          disabled={isFetching || currentPage === i}
        />,
      );
    }
    return pages;
  }

  // Première page
  pages.push(
    <PageButton
      key={1}
      pageNumber={1}
      isActive={currentPage === 1}
      onClick={() => onPageChange(1)}
      disabled={isFetching || currentPage === 1}
    />,
  );

  // Ellipse gauche si nécessaire
  if (currentPage > 3) {
    pages.push(
      <span
        key="ellipsis-left"
        className="w-10 h-10 flex items-center justify-center text-gray-400"
      >
        ...
      </span>,
    );
  }

  // Pages autour de la page courante
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(
      <PageButton
        key={i}
        pageNumber={i}
        isActive={currentPage === i}
        onClick={() => onPageChange(i)}
        disabled={isFetching || currentPage === i}
      />,
    );
  }

  // Ellipse droite si nécessaire
  if (currentPage < totalPages - 2) {
    pages.push(
      <span
        key="ellipsis-right"
        className="w-10 h-10 flex items-center justify-center text-gray-400"
      >
        ...
      </span>,
    );
  }

  // Dernière page
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
