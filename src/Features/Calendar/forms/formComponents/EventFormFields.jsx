export default function EventFormFields({
  register,
  errors,
  isLoading,
  workouts,
  workoutRef,
}) {
  return (
    <>
      {/* Workout */}
      <div className="flex flex-col items-center  gap-2 w-full">
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
              <option key={w.id} value={w.id}>
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
      <div className="flex flex-col items-center  gap-2 w-full">
        <label className="text-sm font-semibold">
          Date <span className="text-red-500">*</span>
        </label>
        <input type="date" className="input py-2" {...register("date")} />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      {/* Heure début */}
      <div className="flex flex-col items-center  gap-2 w-full">
        <label className="text-sm font-semibold">
          Heure de début <span className="text-red-500">*</span>
        </label>
        <input type="time" className="input py-2" {...register("startTime")} />
        {errors.startTime && (
          <p className="text-red-500 text-sm">{errors.startTime.message}</p>
        )}
      </div>

      {/* Durée */}
      <div className="flex flex-col items-center  gap-2 w-full">
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
      <div className="flex flex-col items-center  gap-2 w-full">
        <label className="text-sm font-semibold">Heure de fin</label>
        <input type="time" className="input py-2" {...register("endTime")} />
        {errors.endTime && (
          <p className="text-red-500 text-sm">{errors.endTime.message}</p>
        )}
      </div>
    </>
  );
}
