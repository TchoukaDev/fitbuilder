import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useModals } from "@/Providers/Modals";
import { Button, LoaderButton } from "@/Global/components";
import { useWorkouts } from "@/Features/Workouts/hooks";
import { eventSchema } from "../utils/EventSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlanSession } from "@/Features/Sessions/hooks";
import { toast } from "react-toastify";

export default function NewEventForm({ userId, selectedDate }) {
  const { mutate: planSession, isPending } = usePlanSession(userId);
  const { closeModal } = useModals();

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
      workout: "",
      date: selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      startTime: selectedDate
        ? `${String(selectedDate.getHours()).padStart(2, "0")}:${String(
            selectedDate.getMinutes(),
          ).padStart(2, "0")}`
        : "",
      duration: 60,
      endTime: "",
    },
  });

  const workoutRef = useRef(null);

  const { data: workouts, isLoading } = useWorkouts(null, userId, {
    staleTime: 0,
    refetchOnMount: true,
  });

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

  return (
    <form
      className="flex flex-col items-center gap-5 p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Workout */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-semibold">
          Plan d'entraînement <span className="text-red-500">*</span>
        </label>
        <select
          className="input py-2"
          {...register("workout")}
          ref={(e) => {
            register("workout").ref(e);
            workoutRef.current = e;
          }}
        >
          <option value="">--- Sélectionner ---</option>
          {isLoading ? (
            <option>Chargement...</option>
          ) : (
            workouts?.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))
          )}
        </select>
        {errors.workout && (
          <p className="text-red-500 text-sm">{errors.workout.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-semibold">
          Date <span className="text-red-500">*</span>
        </label>
        <input type="date" className="input py-2" {...register("date")} />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      {/* Heure début */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-semibold">
          Heure de début <span className="text-red-500">*</span>
        </label>
        <input type="time" className="input py-2" {...register("startTime")} />
        {errors.startTime && (
          <p className="text-red-500 text-sm">{errors.startTime.message}</p>
        )}
      </div>

      {/* Durée */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-semibold">
          Durée (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={1440}
          className="input py-2"
          {...register("duration", { valueAsNumber: true })}
        />
        {errors.duration && (
          <p className="text-red-500 text-sm">{errors.duration.message}</p>
        )}
      </div>

      {/* Heure fin */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-semibold">Heure de fin</label>
        <input type="time" className="input py-2" {...register("endTime")} />
        {errors.endTime && (
          <p className="text-red-500 text-sm">{errors.endTime.message}</p>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
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
    </form>
  );
}
