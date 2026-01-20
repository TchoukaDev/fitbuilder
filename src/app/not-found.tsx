import { Header } from "@/Global/components";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center gap-10 min-h-[50vh]">
        <h1>Erreur 404</h1>
        <p>
          Oups! La page que vous recherchez n'existe pas ou a été supprimée.
        </p>
      </main>
    </>
  );
}
