import { ToastContainer } from "react-toastify";
import "./globals.css";
import AuthProvider from "../Providers/Auth/AuthProvider";
import { QueryProvider } from "@/Providers/QueryClient/QueryClientProvider";
import { ModalProvider } from "@/Providers/Modals/ModalContext";

export const metadata = {
  title: "FitBuilder, votre assistant de musculation personnalisé",
  description:
    "Bienvenue sur FitBuilder. Inscrivez  puis connectez-vous pour commencer à créer votre propre programme de musculation personnalisé et adapté à votre objectif.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gradient-light bg-fixed text-primary-900 min-h-screen">
        <AuthProvider>
          <QueryProvider>
            <ModalProvider>
              <ToastContainer
                position="top-right"
                theme="colored"
                closeOnClick={true}
                draggable={true}
                newestOnTop={true}
              />
              {children}
              <div id="portal-root"></div>
            </ModalProvider>{" "}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
