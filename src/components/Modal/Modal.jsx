"use client";
import { createPortal } from "react-dom";
import NewExerciceForm from "../Forms/newExerciceForm/newExerciceForm";

export default function Modal({ onClose }) {
  return createPortal(
    <div
      onClick={() => onClose()}
      className="fixed bg-black/25 inset-0 flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-blue-50 p-10 min-w-[300px] rounded"
      >
        <NewExerciceForm onClose={onClose} />
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
}
