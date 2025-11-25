import { Header } from "@/Global/components";

export default function notFound() {
  return (
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center">
        <h1>Erreur 404</h1>
        <p>La page que vous recherchez n'existe pas ou a été supprimée.</p>
      </main>
    </div>
  );
}
