import Link from "next/link";
import { Button } from "@/Global/components/ui/Buttons";

export default function NotFound() {
  return (
    <>

      <main className="flex flex-col items-center justify-center gap-10 min-h-[50vh]">
        <h1>Erreur 404</h1>
        <p>
          Oups! La page que vous recherchez n'existe pas ou a été supprimée.
        </p>

        <p>Retour à l'accueil</p>
        <Button asChild><Link href="/">Retour à l'accueil</Link></Button>
      </main>
    </>
  );
}
