"use client";
import { useEffect, useState } from "react";
import WorkoutTabs from "../WorkoutTabs/WorkoutTabs";
import WorkoutTemplateCard from "../WorkerTemplateCard/WorkoutTemplateCard";
import Link from "next/link";

export default function WorkoutTemplateList({
  isAdmin = false,
  initialTemplates,
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [activeTab, setActiveTab] = useState("all");
  console.log(activeTab);

  // Mes templates en fonction du type d'utilisateur
  const myTemplates = isAdmin
    ? templates?.filter((t) => t.type === "public")
    : templates?.filter((t) => t.type === "private");

  const counts = {
    all: templates?.length || 0,
    mine: myTemplates?.length || 0,
  };

  // Synchronisation avec données serveur
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  const handleDelete = () => {
    alert("workout Supprimé");
  };

  const handleUpdate = () => {
    alert("workout modifié");
  };
  return (
    <div>
      <div>
        {/* ONGLETS */}
        <WorkoutTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      </div>
      {/* Cards */}
      {templates?.map((template) => (
        <WorkoutTemplateCard
          key={template?.id}
          workout={template}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}

      {/* Bouton créer */}
      {activeTab === "mine" && (
        <Link href="/workouts/create" className="LinkButton">
          + Créer un nouvel entraînement
        </Link>
      )}
    </div>
  );
}
