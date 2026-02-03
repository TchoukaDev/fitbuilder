import { useState, useEffect } from "react";
import { View } from "react-big-calendar";



export default function useCalendarStates() {
  // 📅 STATES
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState<View>("month");
  const [statusFilter, setStatusFilter] = useState(["all"]);
  const [currentDate, setCurrentDate] = useState(new Date());

  
  // 📱 DÉTECTION DE LA TAILLE D'ÉCRAN
  useEffect(() => {
    // Fonction qui vérifie si la largeur d'écran est < 768px
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile && currentView === "month") {
        setCurrentView("agenda");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [currentView]); // ⚠️ Re-exécuter l'effet si currentView change

  return {
    isMobile,
    currentView,
    setCurrentView,
    statusFilter,
    setStatusFilter,
    currentDate,
    setCurrentDate,
  };
}
