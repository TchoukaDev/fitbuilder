// ✅ Bloquer les touches interdites
export const handleKeyDown = (e) => {
  if (["-", "+", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
};
