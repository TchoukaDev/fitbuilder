"use client";

// Liste les plans d'entraînement de l'utilisateur avec leurs actions.
import Link from "next/link";
import WorkoutCard from "./WorkoutCard";
import { useDeleteWorkout, useWorkouts } from "../../hooks";
import { Button, DeleteConfirmModal } from "@/Global/components";
import { useModals } from "@/Providers/Modals";
import { useRouter } from "next/navigation";
import { Workout } from "@/types/workout";
import { toast } from "react-toastify";

interface WorkoutListProps {
  initialWorkouts: Workout[];
  userId: string
}

export default function WorkoutList({ initialWorkouts, userId }: WorkoutListProps) {
  const { data: workouts = [] } = useWorkouts({ initialData: initialWorkouts, userId });
  const { mutate: deleteWorkout, isPending: isDeleting } =
    useDeleteWorkout(userId);
  const { isOpen, closeModal, getModalData } = useModals();
  const router = useRouter();

  const handleDelete = async (workoutId: string) => {
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
      <h1>📋 Mes plans d'entraînement ({count})</h1>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="mb-10 flex justify-center md:justify-start">
          <Button width="w-fit" asChild>
            <Link href="/workouts/create">+ Créer un nouvel entraînement</Link>
          </Button>
        </div>
        {/* Cards */}
        {workouts?.map((workout: Workout) => (
          <WorkoutCard key={workout?.id} workout={workout} userId={userId} />
        ))}{" "}
      </div>
      {/* Modale de suppression */}
      {isOpen("deleteConfirm") && (
        <DeleteConfirmModal
          title={title}
          message={message}
          isLoading={isDeleting}
          onConfirm={() => { const id = getModalData<{ id: string }>("deleteConfirm")?.id; if (id) handleDelete(id) }}
        />
      )}
    </>
  );
}
