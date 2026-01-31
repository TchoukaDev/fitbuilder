import { useRef, useEffect } from "react";
import { formatDateToInput, formatDateToLocal } from "../utils";
import { useWorkouts } from "@/Features/Workouts/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "../utils";
import { useModals } from "@/Providers/Modals";

export default function useEventForm({
  event = null,
  newEvent = false,
  selectedDate = null,
  userId = null,
}) {
  const session = event?.resource;
  const workoutRef = useRef(null);

  // ✅ Refs pour éviter les boucles
  const isUpdatingEndTime = useRef(false);
  const isUpdatingDuration = useRef(false);

  const { closeModal } = useModals();

  const { data: workouts = [], isFetching } = useWorkouts({
    initialData: [], userId, options: {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  });

  const newDefaultValues = {
    workout: "",
    date: selectedDate
      ? formatDateToInput(selectedDate)
      : formatDateToInput(new Date()),
    startTime: selectedDate
      ? `${String(selectedDate.getHours()).padStart(2, "0")}:${String(
        selectedDate.getMinutes(),
      ).padStart(2, "0")}`
      : "",
    duration: 60,
    endTime: "",
  };

  const updateDefaultValues = {
    workout: session?.workoutId,
    date: session?.scheduledDate
      ? formatDateToLocal(session.scheduledDate)
      : formatDateToLocal(new Date()),
    startTime: session?.scheduledDate
      ? `${String(new Date(session.scheduledDate).getHours()).padStart(
        2,
        "0",
      )}:${String(new Date(session.scheduledDate).getMinutes()).padStart(
        2,
        "0",
      )}`
      : "",
    duration: session?.estimatedDuration || 60,
    endTime: "",
  };

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
    defaultValues: newEvent ? newDefaultValues : updateDefaultValues,
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

    const workout = workouts.find((w) => w.id === workoutId);
    if (workout?.estimatedDuration && workout.estimatedDuration !== duration) {
      setValue("duration", workout.estimatedDuration);
    }
  }, [workoutId, workouts]);

  // ========================================
  // 2️⃣ startTime OU duration change → Calculer endTime
  // ========================================
  useEffect(() => {
    if (!startTime || !duration) return;

    // ✅ Si on est en train de mettre à jour la duration, ne pas recalculer endTime
    if (isUpdatingDuration.current) {
      isUpdatingDuration.current = false;
      return;
    }

    const [h, m] = startTime.split(":");
    const start = new Date();
    start.setHours(parseInt(h), parseInt(m), 0, 0);

    const end = new Date(start.getTime() + duration * 60 * 1000);

    const endFormatted = `${String(end.getHours()).padStart(2, "0")}:${String(
      end.getMinutes(),
    ).padStart(2, "0")}`;

    if (endFormatted !== endTime) {
      isUpdatingEndTime.current = true; // ✅ Flag pour éviter la boucle
      setValue("endTime", endFormatted);
      trigger("endTime");
    }
  }, [startTime, duration]);

  // ========================================
  // 3️⃣ endTime change manuellement → Recalculer duration
  // ========================================
  useEffect(() => {
    if (!startTime || !endTime) return;

    // ✅ Si c'est nous qui avons mis à jour endTime, ne pas recalculer duration
    if (isUpdatingEndTime.current) {
      isUpdatingEndTime.current = false;
      return;
    }

    const [sh, sm] = startTime.split(":");
    const [eh, em] = endTime.split(":");

    const start = new Date();
    start.setHours(parseInt(sh), parseInt(sm), 0, 0);

    const end = new Date();
    end.setHours(parseInt(eh), parseInt(em), 0, 0);

    const diff = Math.round((end - start) / (60 * 1000));

    if (diff > 0 && diff !== duration) {
      isUpdatingDuration.current = true; // ✅ Flag pour éviter la boucle
      setValue("duration", diff);
      trigger("duration");
    }
  }, [endTime]);

  // Focus au montage
  useEffect(() => {
    workoutRef.current?.focus();
  }, []);

  return {
    workoutRef,
    register,
    handleSubmit,
    workouts,
    isFetching,
    formState: { errors },
    closeModal,
  };
}
