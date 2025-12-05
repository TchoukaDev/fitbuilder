"use client";

const { createContext, useState, useContext } = require("react");

const ModalContext = createContext();

export const useModals = () => useContext(ModalContext);

export default function ModalProvider({ children }) {
  const [modals, setModals] = useState({});
  const [modalData, setModalData] = useState({});

  const openModal = (name, data = null) => {
    setModals((prev) => ({ ...prev, [name]: true }));
    setModalData((prev) => ({ ...prev, [name]: data }));
  };

  const closeModal = (name) => {
    setModals((prev) => ({ ...prev, [name]: false }));
    setModalData((prev) => ({ ...prev, [name]: null }));
  };

  const isOpen = (name) => !!modals[name];
  const getModalData = (name) => modalData[name];

  const closeAllModals = () => {
    setModals({});
    setModalData({});
  };

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, isOpen, getModalData, closeAllModals }}
    >
      {children}
    </ModalContext.Provider>
  );
}
