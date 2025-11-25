// components/Features/Sessions/SetRow/SetRow.jsx

import { handleKeyDown } from "@/Global/utils";
import { motion } from "framer-motion";

export default function SetRow({
  setIndex,
  setData,
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

      {/* INPUT POIDS */}
      <div className="space-x-2">
        <input
          type="number"
          min="0"
          step="0.5"
          placeholder="Poids"
          value={setData?.weight ?? ""}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const value = e.target.value;

            if (value === "") {
              onSetChange("weight", null);
              return;
            }

            const num = parseFloat(value);

            if (!isNaN(num) && num >= 0) {
              onSetChange("weight", num);
            } else {
              onSetChange("weight", null);
            }
          }}
          className="input p-1 md:p-3 w-14 md:w-20"
        />
        <span>kg</span>
      </div>

      <span>×</span>

      {/* INPUT REPS */}
      <div className="space-x-2">
        <input
          type="number"
          min="0"
          placeholder="Reps"
          value={setData?.reps ?? ""}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const value = e.target.value;

            if (value === "") {
              onSetChange("reps", null);
              return;
            }

            const num = parseInt(value, 10);

            if (!isNaN(num) && num >= 0) {
              onSetChange("reps", num);
            } else {
              onSetChange("reps", null);
            }
          }}
          className="input p-1 md:p-3 w-14 md:w-20"
        />
        <span>reps</span>
      </div>

      {/* CHECKBOX */}
      <div className="flex flex-col gap-1 items-center">
        <label className="text-xs" htmlFor={`setComplete-${setIndex}`}>
          Fait
        </label>
        <input
          type="checkbox"
          id={`setComplete-${setIndex}`}
          checked={setData?.completed || false}
          onChange={() => onSetComplete()}
          className="w-3 md:w-5 h-3 md:h-5 cursor-pointer"
        />
      </div>
    </motion.div>
  );
}
