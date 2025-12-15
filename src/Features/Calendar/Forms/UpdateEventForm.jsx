import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useModals } from "@/Providers/Modals";
import { Button, LoaderButton } from "@/Global/components";
import { useWorkouts } from "@/Features/Workouts/hooks";
import { eventSchema } from "../utils/EventSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdatePlannedSession } from "@/Features/Sessions/hooks";
import { toast } from "react-toastify";
import RequiredFields from "@/Global/components/ui/FormsComponents/RequiredFields";
import EventFormFields from "../forms/formComponents/EventFormFields";

export default function UpdateEventForm({ userId, event }) {
  const session = event.resource;
  const { mutate: updateSession, isPending: isUpdating } =
    useUpdatePlannedSession(userId, null);
  const { closeModal } = useModals();
  const { data: workouts, isLoading } = useWorkouts(null, userId, {
    staleTime: 0,
    refetchOnMount: true,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      workout: session.workoutId,
      date: session.scheduledDate
        ? new Date(session.scheduledDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      startTime: session.scheduledDate
        ? `${String(new Date(session.scheduledDate).getHours()).padStart(
            2,
            "0",
          )}:${String(new Date(session.scheduledDate).getMinutes()).padStart(
            2,
            "0",
          )}`
        : "",
      duration: session.estimatedDuration,
      endTime: session.scheduledDate
        ? `${String(new Date(session.scheduledDate).getHours()).padStart(
            2,
            "0",
          )}:${String(new Date(session.scheduledDate).getMinutes()).padStart(
            2,
            "0",
          )}`
        : "",
    },
  });

  const workoutRef = useRef(null);

  // Observer les champs
  const workoutId = watch("workout");
  const startTime = watch("startTime");
  const duration = watch("duration");
  const endTime = watch("endTime");

  // ========================================
  // 1️⃣ Workout change → Pré-remplir duration
  // ========================================
  useEffect(() => {
    if (!workoutId || !workouts) return;

    const workout = workouts.find((w) => w._id === workoutId);
    if (workout?.estimatedDuration) {
      setValue("duration", workout.estimatedDuration);
    }
  }, [workoutId, workouts, setValue]);

  // ========================================
  // 2️⃣ startTime OU duration change → Calculer endTime
  // ========================================
  useEffect(() => {
    if (!startTime || !duration) return;

    // Créer une date avec l'heure de début
    const [h, m] = startTime.split(":");
    const start = new Date();
    start.setHours(parseInt(h), parseInt(m), 0, 0);

    // Ajouter la durée
    const end = new Date(start.getTime() + duration * 60 * 1000);

    // Formatter en HH:MM
    const endFormatted = `${String(end.getHours()).padStart(2, "0")}:${String(
      end.getMinutes(),
    ).padStart(2, "0")}`;

    setValue("endTime", endFormatted);
    trigger("endTime");
  }, [startTime, duration, setValue, trigger]);

  // ========================================
  // 3️⃣ endTime change manuellement → Recalculer duration
  // ========================================
  useEffect(() => {
    if (!startTime || !endTime) return;

    // Créer les dates
    const [sh, sm] = startTime.split(":");
    const [eh, em] = endTime.split(":");

    const start = new Date();
    start.setHours(parseInt(sh), parseInt(sm), 0, 0);

    const end = new Date();
    end.setHours(parseInt(eh), parseInt(em), 0, 0);

    // Calculer la différence en minutes
    const diff = Math.round((end - start) / (60 * 1000));

    // Mettre à jour duration UNIQUEMENT si positif
    if (diff > 0 && diff !== duration) {
      setValue("duration", diff);
      trigger("duration");
    }
  }, [endTime, trigger, setValue]); // ✅ Uniquement quand endTime change

  // Focus au montage
  useEffect(() => {
    workoutRef.current?.focus();
  }, []);

  // ========================================
  // SUBMIT
  // ========================================
  const onSubmit = (data) => {
    const workout = workouts.find((w) => w._id === data.workout);
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
        sessionId: session._id,
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

  return (
    <form
      className="flex flex-col items-center gap-5 p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <EventFormFields
        register={register}
        errors={errors}
        isLoading={isUpdating}
        workoutRef={workoutRef}
        workouts={workouts}
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
