"use client";

// Liste les plans d'entraînement de l'utilisateur avec leurs actions.
import Link from "next/link";
import WorkoutCard from "./WorkoutCard";
import { useDeleteWorkout, useWorkouts } from "../../hooks";
import { Button, DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";

export default function WorkoutList({ initialWorkouts, userId }) {
  const { data: workouts = [] } = useWorkouts(initialWorkouts, userId);
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
  const count = workouts?.length;
  const title = "Supprimer l'entraînement";
  const message = "Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ?";
  return (
    <>
      {/* Titre h1 dans composant client pour compteur géré par useQuery */}
      <h1>Mes plans d'entraînement ({count})</h1>
      <div>
        <div className="mb-10">
          <Button width="w-fit" asChild>
            <Link href="/workouts/create">+ Créer un nouvel entraînement</Link>
          </Button>
        </div>
        {/* Cards */}
        {workouts?.map((workout) => (
          <WorkoutCard key={workout?._id} workout={workout} userId={userId} />
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
