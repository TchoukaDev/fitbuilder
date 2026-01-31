import { Button, LoaderButton } from "@/Global/components";
import { useUpdatePlannedSession } from "@/Features/Sessions/hooks/useQuerySessions";
import { toast } from "react-toastify";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { EventFormFields } from "../forms";
import { useEventForm } from "../hooks";
import { ClipLoader } from "react-spinners";

export default function UpdateEventForm({ userId, event }) {
  const session = event.resource;
  const {
    workouts,
    isFetching,
    workoutRef,
    closeModal,
    register,
    handleSubmit,
    formState: { errors },
  } = useEventForm({ event, userId });

  const { mutate: updateSession, isPending: isUpdating } =
    useUpdatePlannedSession(userId, null);

  // ========================================
  // SUBMIT
  // ========================================
  const onSubmit = (data) => {
    const workout = workouts?.find((w) => w.id === data.workout);
    const scheduledDate = new Date(`${data.date}T${data.startTime}`);
    const updatedSession = {
      workoutId: data.workout,
      workoutName: workout.name,
      exercises: workout.exercises,
      scheduledDate: scheduledDate.toISOString(),
      estimatedDuration: data.duration,
    };
    updateSession(
      {
        sessionId: session.id,
        updatedSession,
      },
      {
        onSuccess: () => {
          toast.success("Événement modifié avec succès");
          closeModal("editEvent");
          closeModal("eventDetails");
        },
        onError: (error) => {
          toast.error(error.message || "Erreur");
        },
      },
    );
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[500px] p-12">
        <ClipLoader size={40} color="#7557ff" />
        <span className="text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col items-center gap-5 p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <EventFormFields
        register={register}
        errors={errors}
        isLoading={isFetching}
        workouts={workouts}
        workoutRef={workoutRef}
      />

      {/* Boutons */}
      <div className="modalFooter">
        <Button type="button" close onClick={() => closeModal("editEvent")}>
          Annuler
        </Button>
        <LoaderButton
          isLoading={isUpdating}
          label="Modifier"
          loadingText="Modification en cours"
          disabled={isUpdating}
          type="submit"
          onClick={handleSubmit(onSubmit)}
        >
          Modifier
        </LoaderButton>
      </div>
      <RequiredFields />
    </form>
  );
}
