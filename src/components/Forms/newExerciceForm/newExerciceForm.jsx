"use client";

import { useState } from "react";
import Label from "../FormsComponents/Label/Label";
import Button from "../../Buttons/Button";
import { toast } from "react-toastify";

export default function NewExerciceForm({ onClose }) {
  // State
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    // 1. Validation
    if (!name.trim() || !muscle.trim() || !equipment) {
      setError("Veuillez compléter tous les champs obligatoires");
      return;
    }

    // 2. Envoi à l'API
    try {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, muscle, description, equipment }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        // Réinitialiser le formulaire
        setName("");
        setMuscle("");
        setDescription("");
        setEquipment("");
        onClose();
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 items-center justify-center"
    >
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Label htmlFor="name" value={name}>
          Intitulé
        </Label>
      </div>

      <div className="relative">
        <input
          className="input peer"
          required
          placeholder=""
          id="muscle"
          name="muscle"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
        />
        <Label htmlFor="muscle" value={muscle}>
          Muscle
        </Label>
      </div>

      <label htmlFor="equipment">Matériel :</label>
      <select
        className="input"
        id="equipment"
        name="equipment"
        value={equipment}
        onChange={(e) => setEquipment(e.target.value)}
      >
        <option value="">-- Sélectionner --</option>
        <option value="Poids du corps">Poids du corps</option>
        <option value="Haltères">Haltères</option>
        <option value="Barre">Barre</option>
        <option value="Machine">Machine</option>
        <option value="Élastique">Élastique</option>
      </select>

      <div className="relative">
        <textarea
          className="input peer"
          placeholder=""
          id="description"
          name="description"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Label htmlFor="description" value={description}>
          Description
        </Label>
      </div>
      <div className="flex gap-4">
        <Button
          color="bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300"
          onClick={() => onClose()}
          type="button"
        >
          Fermer
        </Button>
        <Button type="submit">Valider</Button>
      </div>
    </form>
  );
}
