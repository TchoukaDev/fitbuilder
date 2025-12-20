import { Button, LoaderButton } from "@/Global/components";
import { usePlanSession } from "@/Features/Sessions/hooks";
import { toast } from "react-toastify";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import { EventFormFields } from "../forms";
import { useEventForm } from "../hooks";
import { ClipLoader } from "react-spinners";

export default function NewEventForm({ userId, selectedDate }) {
  const { mutate: planSession, isPending } = usePlanSession(userId);

  const {
    workouts,
    isFetching,
    workoutRef,
    register,
    handleSubmit,
    closeModal,
    formState: { errors },
  } = useEventForm({ newEvent: true, selectedDate, userId });

  // ========================================
  // SUBMIT
  // ========================================
  const onSubmit = (data) => {
    const workout = workouts?.find((w) => w._id === data.workout);
    const scheduledDate = new Date(`${data.date}T${data.startTime}`);

    planSession(
      {
        workoutId: data.workout,
        workoutName: workout.name,
        exercises: workout.exercises,
        scheduledDate: scheduledDate.toISOString(),
        estimatedDuration: data.duration,
        isPlanning: true,
      },
      {
        onSuccess: () => {
          closeModal("newEvent");
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
        <Button type="button" close onClick={() => closeModal("newEvent")}>
          Annuler
        </Button>
        <LoaderButton
          isLoading={isPending}
          label="Planifier"
          loadingText="Planification en cours"
          disabled={isPending}
          type="submit"
          onClick={handleSubmit(onSubmit)}
        >
          Planifier
        </LoaderButton>
      </div>
      <RequiredFields />
    </form>
  );
}
