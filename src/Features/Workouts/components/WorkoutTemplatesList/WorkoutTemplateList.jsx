"use client";

// Liste les plans d'entraînement de l'utilisateur avec leurs actions.
import Link from "next/link";
import WorkoutTemplateCard from "./WorkoutTemplateCard";
import { useDeleteWorkout, useWorkouts } from "../../hooks";
import { DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";

export default function WorkoutTemplateList({ initialTemplates, userId }) {
  const { data: templates = [] } = useWorkouts(initialTemplates, userId);
  const { mutate: deleteWorkout, isPending: isDeleting } =
    useDeleteWorkout(userId);
  const { isOpen, closeModal, getModalData } = useModals();
  const router = useRouter();

  const handleDelete = async (workoutId) => {
    deleteWorkout(workoutId, {
      onSuccess: () => {
        router.push("/workouts");
        router.refresh();
        closeModal("deleteConfirm");
      },
      onError: (error) => {
        toast.error("Erreur lors de la suppression");
      },
    });
  };
  const count = templates?.length;
  const title = "Supprimer l'entraînement";
  const message = "Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ?";
  return (
    <>
      {/* Titre h1 dans composant client pour compteur géré par useQuery */}
      <h1>Mes plans d'entraînement ({count})</h1>
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
        {/* Modale de suppression */}
        {isOpen("deleteConfirm") && (
          <DeleteConfirmModal
            title={title}
            message={message}
            isLoading={isDeleting}
            onConfirm={() => handleDelete(getModalData("deleteConfirm").id)}
          />
        )}
      </div>
    </>
  );
}
