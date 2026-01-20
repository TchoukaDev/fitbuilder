// Composant pour afficher un bouton avec un loader
import { Button } from "@/Global/components";
import { ClipLoader } from "react-spinners";
import { ButtonProps } from "./Button";

export type LoaderButtonProps = ButtonProps & {
  isLoading: boolean;
  loadingText: string;

};

export default function LoaderButton({
  close,
  isLoading,
  loadingText = "Chargement...",
  children,
  disabled,
  ...props
}: LoaderButtonProps) {
  return (
    <Button {...props} disabled={disabled} close={close}>
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <ClipLoader size={15} color="#fff" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
