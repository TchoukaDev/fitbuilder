import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ShowPassword({ showPassword, onClick }) {
  return (
    /*Bouton d'affichage mot de passe */

    <button
      type="button"
      onClick={onClick}
      className="absolute right-2 top-1/2 -translate-y-[calc(50%)] text-primary-300 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      aria-label={
        showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
      }
    >
      {showPassword ? (
        <FaEyeSlash
          title="Afficher le mot de passe"
          color="#7557ff"
          className="h-4 w-4"
        />
      ) : (
        <FaEye
          title="Cacher le mot de passe"
          color="#7557ff"
          className="h-4 w-4"
        />
      )}
    </button>
  );
}
