"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

type ModalState = {
  [key: string]: boolean;
};

type ModalDataState = {
  [key: string]: unknown;
};

type ModalContextType = {
  openModal: (name: string, data?: unknown) => void;
  closeModal: (name: string) => void;
  isOpen: (name: string) => boolean;
  getModalData: <T = unknown, >(name: string) => T | null;
  closeAllModals: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModals = (): ModalContextType => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModals doit être utilisé dans un <ModalProvider>");
  }

  return context;
};

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalState>({});
  const [modalData, setModalData] = useState<ModalDataState>({});
  const pathname = usePathname();

  const openModal = (name: string, data: unknown = null) => {
    setModals((prev) => ({ ...prev, [name]: true }));
    setModalData((prev) => ({ ...prev, [name]: data }));
  };

  const closeModal = (name: string) => {
    setModals((prev) => ({ ...prev, [name]: false }));
    setModalData((prev) => ({ ...prev, [name]: null }));
  };

  const isOpen = (name: string) => !!modals[name];
  const getModalData = <T,>(name: string): T | null => {
    return modalData[name] as T | null;
  };

  const closeAllModals = () => {
    setModals({});
    setModalData({});
  };

  useEffect(() => {
    closeAllModals();
  }, [pathname]);

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, isOpen, getModalData, closeAllModals }}
    >
      {children}
    </ModalContext.Provider>
  );
}
