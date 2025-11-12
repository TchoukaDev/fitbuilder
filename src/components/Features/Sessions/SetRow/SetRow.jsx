import { motion } from "framer-motion";

export default function SetRow({
  setIndex,
  setData,
  targetWeight,
  onSetChange,
  onSetComplete,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-2 text-xs md:text-base justify-evenly bg-white rounded border"
    >
      <span className="font-semibold w-8">#{setIndex + 1}</span>

      <div className="space-x-2">
        <input
          type="number"
          placeholder="Poids"
          value={setData?.weight || targetWeight || ""}
          onChange={(e) => onSetChange("weight", parseFloat(e.target.value))}
          className="input p-1 md:p-3 w-14 md:w-20"
        />
        <span>kg</span>
      </div>

      <span>×</span>

      <div className="space-x-2">
        <input
          type="number"
          placeholder="Reps"
          value={setData?.reps || ""}
          onChange={(e) => onSetChange("reps", parseInt(e.target.value))}
          className="input p-1 md:p-3 w-14 md:w-20"
        />
        <span>reps</span>
      </div>
      <div className="flex flex-col gap-1 items-center">
        <label className="text-xs" htmlFor="setComplete">
          Fait
        </label>
        <input
          type="checkbox"
          name="setComplete"
          id="setComplete"
          checked={setData?.completed || false}
          onChange={() => onSetComplete()}
          className="w-3 md:w-5 h-3 md:h-5 cursor-pointer"
        />
      </div>
    </motion.div>
  );
}
