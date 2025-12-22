import { ToastContainer } from "react-toastify";
import "./globals.css";
import { QueryClientProvider } from "@/Providers/QueryClient";
import { ModalProvider } from "@/Providers/Modals";
import { AuthProvider } from "@/Providers/Auth";
import Footer from "@/Global/components/layout/Footer";
import localFont from "next/font/local";

const graphik = localFont({
  src: [
    {
      path: "../fonts/Graphik-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Graphik-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Graphik-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-graphik", // optionnel, utile pour CSS variables
});

// Inter variable font (poids 100 à 900)
const inter = localFont({
  src: "../fonts/Inter-VariableFont.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "FitBuilder, votre assistant de musculation personnalisé",
  description:
    "Bienvenue sur FitBuilder. Inscrivez  puis connectez-vous pour commencer à créer votre propre programme de musculation personnalisé et adapté à votre objectif.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${graphik.variable} ${inter.variable}`}>
      <body className="bg-gradient-light bg-fixed text-primary-900 min-h-screen flex flex-col">
        <AuthProvider>
          <QueryClientProvider>
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
              <Footer />
            </ModalProvider>{" "}
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
