// Retourne la couleur en fonction du statut
export function getColorByStatus(status) {
  const colors = {
    planned: "#5c31e0", // 🔵primary-400
    "in-progress": "#ffaa66", // 🟠 accent-400
    completed: "oklch(79.2% 0.209 151.711)", // 🟢 green-400
  };

  const colorHover = {
    planned: "#260d87", // 🔵primary-500
    "in-progress": "#ff6600", // 🟠 accent-500
    completed: "oklch(72.3% 0.219 149.579)", // 🟢 green-500
  };
  return {
    color: colors[status] || colors.planned,
    colorHover: colorHover[status] || colorHover.planned,
  };
}
