"use client";
import { useState } from "react";
import Modal from "../Modal";
import Button from "@/components/Buttons/Button";

export default function ModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Créer un nouvel exercice</Button>
      {isOpen && <Modal onClose={onClose} />}
    </>
  );
}
