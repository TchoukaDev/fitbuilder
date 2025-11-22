export default function Button({
  onClick,
  type,
  disabled,
  children,
  close,
  full,
  width,
  title,
  label,
}) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center ${
        width ? width : "min-w-[150px]"
      } gap-2 ${full && "w-full"} ${
        close
          ? "bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300"
          : "bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-primary-50"
      }  p-3 rounded cursor-pointer transition-all duration-200`}
    >
      {children}
    </button>
  );
}
