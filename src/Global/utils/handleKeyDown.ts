// ✅ Bloquer les touches interdites
export const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (["-", "+", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
};
