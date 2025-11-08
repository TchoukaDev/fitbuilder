export default function Label({ children, htmlFor, value }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`absolute left-2  transition-all bg-transparent cursor-text
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-primary-300
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent-500 pointer-events-none ${
        (value || value === 0) && "top-1 text-xs text-primary-300"
      }`}
    >
      {children}
    </label>
  );
}
