export default function ModalHeader({ children }) {
  return (
    <div className="flex justify-center items-center p-4 border-b mb-5">
      <h2>{children}</h2>
    </div>
  );
}
