import { useModals } from "@/Providers/Modals";
import { X } from "lucide-react";
import { useBlockScroll } from "@/Global/hooks";
import { ModalHeader } from ".";
import React from "react";

interface ModalLayoutProps {
  children: React.ReactNode;
  title: string;
  modalToClose: string;
  option?: () => void;
}

// Layout des modals
export default function ModalLayout({ children, title, modalToClose, option }: ModalLayoutProps) {
  useBlockScroll();
  const { closeModal } = useModals();
  return (
    <div className="fixed inset-0  bg-black/30 flex items-center justify-center z-10  md:p-4">
      <div className=" relative bg-white rounded-lg max-w-md w-full shadow-xl p-6 max-h-full overflow-y-auto">
        {/* Fermeture */}
        <button
          className="absolute right-4 top-4 cursor-pointer hover:text-accent-600"
          onClick={() => {
            closeModal(modalToClose);
            option && option();
          }}
        >
          <X size={24} />
        </button>{" "}
        <ModalHeader>{title}</ModalHeader>
        {children}
      </div>
    </div>
  );
}
