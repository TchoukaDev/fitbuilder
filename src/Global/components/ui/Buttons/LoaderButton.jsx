// Composant pour afficher un bouton avec un loader
import { Button } from "@/Global/components";
import { ClipLoader } from "react-spinners";

export default function LoaderButton({
  close,
  isLoading,
  loadingText = "Chargement...",
  children,
  disabled,
  ...props
}) {
  return (
    <Button {...props} disabled={isLoading || disabled} close={close}>
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <ClipLoader size={15} color="#7557ff" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
