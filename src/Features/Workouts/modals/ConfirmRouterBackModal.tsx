import { DeleteConfirmModal } from "@/Global/components";

interface ConfirmRouterBackModalProps {
    onRouterBack: () => void;
}
// Modale de confirmation de retour
export default function ConfirmRouterBackModal({ onRouterBack }: ConfirmRouterBackModalProps) {

    return (
        <DeleteConfirmModal title="Quitter l'éditeur" message="Souhaitez-vous quitter l'éditeur? Vous perderez toutes les modifications non enregistrées." onConfirm={onRouterBack} confirmMessage="Quitter l'éditeur" cancelMessage="Annuler" modalToClose="confirmRouterBack" />
    )
}