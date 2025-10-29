import { ClipLoader } from "react-spinners";

export default function Button({ onClick, type, disabled, children, color }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center min-w-[150px] gap-2 ${
        color
          ? color
          : "bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-primary-50"
      }  p-3 rounded cursor-pointer transition-all duration-200`}
    >
      {children}
    </button>
  );
}
