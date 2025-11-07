"use client";

import Link from "next/link";
import WorkoutTemplateCard from "../WorkoutTemplateCard/WorkoutTemplateCard";
import { useWorkouts } from "@/hooks/useWorkouts";

export default function WorkoutTemplateList({ initialTemplates, userId }) {
  const { data: templates = [] } = useWorkouts(initialTemplates, userId);

  const count = templates?.length || 0;

  return (
    <div>
      <Link href="/workouts/create" className="LinkButton mb-10">
        + Créer un nouvel entraînement
      </Link>
      {/* Cards */}
      {templates?.map((template) => (
        <WorkoutTemplateCard
          key={template?._id}
          workout={template}
          userId={userId}
        />
      ))}
    </div>
  );
}
